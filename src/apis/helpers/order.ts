import { Types } from "mongoose"
import { encodeAbiParameters, formatUnits, Hex, keccak256, pad, parseUnits, stringToBytes, toBytes } from "viem"
import { arbitrum, arbitrumSepolia, base, baseSepolia, optimism, optimismSepolia, polygon, polygonAmoy } from "viem/chains"


import { activeChainIds, chains } from "../../config/chainConfig"
import { IDestinationAction, IInput, IOrder, IOutput } from "../../interfaces/order"
import { IAccountBalance, ISpendBalance } from "../../interfaces/token"
import { getTimestampInSeconds } from "../../utils"
import { r } from "../../utils/redis"


const CRAY_ORDR_TYPE_HASH = keccak256(stringToBytes("CrayOrder(Input[] inputs,Output output,address sender,uint256 nonce,uint32 initiateDeadline,uint32 fillDeadline,uint256 settlementExpiry,bytes32 metadata,DestinationAction action)DestinationAction(bytes payload,uint256 gasLimit)Input(uint256 chainId,address token,uint256 amount)Output(uint256 chainId,address token,uint256 minAmountOut,address recipient)"))
const INPUT_TYPEHASH = keccak256(stringToBytes("Input(uint256 chainId,address token,uint256 amount)"))
const OUTPUT_TYPEHASH = keccak256(stringToBytes("Output(uint256 chainId,address token,uint256 minAmountOut,address recipient)"))
const DESTINATION_ACTION_TYPEHASH = keccak256(stringToBytes("DestinationAction(bytes payload,uint256 gasLimit)"))

const INITIATE_DEADLINE = 24 * 60 * 60 // seconds
const FILL_DEADLINE = 24 * 60 * 60 //seconds
const SETTLEMENT_EXPIRY = 24 * 60 * 60 // seconds

const DOMAIN = {
  name: "Cray",
  version: "1",
}

const TYPES = {
    Output: [
        { name: "chainId", type: "uint256" },
        { name: "token", type: "address" },
        { name: "minAmountOut", type: "uint256" },
        { name: "recipient", type: "address" },
    ],
    Input: [
        { name: "chainId", type: "uint256" },
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
    ],
    DestinationAction: [
        { name: "payload", type: "bytes" },
        { name: "gasLimit", type: "uint256" },
    ],
    CrayOrder: [
        { name: "inputs", type: "Input[]" },
        { name: "output", type: "Output" },
        { name: "sender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "initiateDeadline", type: "uint32" },
        { name: "fillDeadline", type: "uint32" },
        { name: "settlementExpiry", type: "uint256" },
        { name: "metadata", type: "bytes32" },
        { name: "action", type: "DestinationAction" },
    ],
}

export const prepareOrder = async (orderId: Types.ObjectId, order: any, balances: IAccountBalance[]) => {
  try {
    // get balance of user on all chains
    let orderAllocation = await calculateAllocation({ balances, amount: order.amount, toChainId: order.destinationChain })
    if(typeof orderAllocation==='boolean'){
      throw new Error('Transfer not possible')
    }
    const totalSpending = orderAllocation.reduce((a:number, b: ISpendBalance)=>a + parseFloat(formatUnits(BigInt(b.spend), b.decimals)),0)
    if(Math.abs(totalSpending-parseFloat(order.amount))>0.1){
      /** totalSpending and order.amount should be same. 
       * but due to rounding errors we are checking they are not deviated more than 0.1 */
      throw new Error('Invalid Allocation')
    }
    const isTestnet = !!chains[order.destinationChain].testnet
    const isInvalidBalances = orderAllocation.some(({chainId})=>!!chains[chainId].testnet!==isTestnet)
    if(isInvalidBalances){
      throw new Error('Invalid Balances')
    }
    // prepare order to sign
    const inputs: IInput[] = Array.isArray(orderAllocation)
      ? orderAllocation.map((allocation) => ({
          chainId: allocation.chainId,
          token: allocation.tokenAddress,
          amount: allocation.spend,
        }))
      : []

    const output: IOutput = {
      token: order.destinationToken,
      minAmountOut: order.minAmountOut as string,
      recipient: order.receiverAddress,
      chainId: order.destinationChain,
    }

    const action: IDestinationAction = {
      gasLimit: order?.action?.gasLimit ?? 0,
      payload: order?.action?.payload ?? '0x',
    }
    const crayOrder = {
      inputs,
      output,
      sender: order.senderAddress as Hex,
      nonce: BigInt('0x' + orderId),
      initiateDeadline: getTimestampInSeconds() + INITIATE_DEADLINE,
      fillDeadline: getTimestampInSeconds() + FILL_DEADLINE,
      settlementExpiry: getTimestampInSeconds() + SETTLEMENT_EXPIRY,
      metadata: pad('0x', { size: 32 }),
      action,
    }
    const typedOrder = {
      domain: DOMAIN,
      types: TYPES,
      primaryType: "CrayOrder",
      message: crayOrder
    }
    const orderHash = hashOrder(crayOrder)
    return { orderHash, typedOrder }
  } catch (error) {
    throw error
  }
}


export const allocationOrder = async (): Promise<number[]> => {
  const gas = {// gas units
    [polygonAmoy.id]: 184123,//amoy
    [baseSepolia.id]: 272046,//base
    [optimismSepolia.id]: 273015,//op
    [arbitrumSepolia.id]: 542240,//arb

    [polygon.id]: 184123,//polygon
    [base.id]: 272046,//base
    [optimism.id]: 273015,//op
    [arbitrum.id]: 542240,//arb
  }
  const coinPrice = await r.HGETALL('coin_price')
  const gasPrice = await r.HGETALL('gas_price')
  /** calculated expected spending gas for evey chains */
  let expectedGas = Object.keys(gas).reduce((obj, chainId) => {
    if (!activeChainIds.has(chainId)) return obj
    obj[chainId] = (gas[chainId] * Number(gasPrice[chainId]) * Number(coinPrice[chainId]) * 10 ** -18)
    return obj
  }, {}) as Record<string, number>
  /** sort by affordable chains */
  return Object.entries(expectedGas).sort((a, b) => a[1] - b[1]).map(_ => Number(_[0]))
}

export const calculateAllocation = async({ balances, amount, toChainId }:{ balances:IAccountBalance[], amount:string, toChainId:number }) => {
  let remainingAmount = parseFloat(amount)
  const transferDetails = []
  if (balances.length === 1) {
      let spend = parseUnits(
        remainingAmount.toFixed(balances[0].decimals).toString(),
        balances[0].decimals
      )
      return [{ ...balances[0], spend: spend.toString() }]
  }
  let chainAllocationOrder:number[] = await allocationOrder()
  /** spending from destination chain will always be most affordable, so move the destination chain to index 0  */
   chainAllocationOrder = moveElementToFirst(toChainId, chainAllocationOrder)
  // Sort the user balances in ascending order
  const sortedBalances = balances.sort(
    (a, b) => chainAllocationOrder.indexOf(a.chainId) - chainAllocationOrder.indexOf(b.chainId) //parseFloat(a.balance) - parseFloat(b.balance)
  )
  // Iterate the balances and transfer the maximum possible amount from each balance
  for (const balance of sortedBalances) {
    let tempRemainingAmount = parseUnits(
      remainingAmount.toFixed(balance.decimals).toString(),
      balance.decimals
    )
    const balanceAmount = BigInt(balance.balance)
    if (balanceAmount < tempRemainingAmount) {
      /** if token balance is less than remaining balance, push token balance in the array and continue the loop */
      transferDetails.push({ ...balance, spend: balanceAmount.toString() })
      tempRemainingAmount = tempRemainingAmount - balanceAmount
      remainingAmount = parseFloat(
        formatUnits(tempRemainingAmount, balance.decimals)
      )
    } else {
      let spend = parseUnits(
      remainingAmount.toFixed(balance.decimals).toString(),
        balance.decimals
      )
      transferDetails.push({ ...balance, spend: spend.toString() })
      remainingAmount = 0
      break
    }
  }

  // If the remaining amount is greater than 0, return transfer is not possible
  if (remainingAmount > 0) {
    return false
  }

  return transferDetails
}

const hashOrderInput = (input: IInput) => {
    return keccak256(
        encodeAbiParameters([{ type: "bytes32" }, { type: "uint256" }, { type: "address" }, { type: "uint256" }], [INPUT_TYPEHASH, BigInt(input.chainId), input.token as Hex, BigInt(input.amount)])
    )
}

export const hashOrderInputs = (inputs: IInput[]) => {
    let packedHashes = new Uint8Array(32 * inputs.length)
    for (let i = 0; i < inputs.length; i++) {
        let inputHash = hashOrderInput(inputs[i]) // Call the new function
        packedHashes.set(toBytes(inputHash), i * 32)
    }
    return keccak256(packedHashes)
}

export const hashOrderOutput = (output: IOutput) => {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }, { type: "address" }, { type: "uint256" }, { type: "address" }],
      [OUTPUT_TYPEHASH, BigInt(output.chainId), output.token as Hex, BigInt(output.minAmountOut), output.recipient as Hex]
    )
  )
}

export const hashFullfillOrder = (params: { orderHash: string; solverAddress: string }) => {
  return  keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }], [params.orderHash as Hex, params.solverAddress as Hex]))

}

export const hashOrderAction = (action: IDestinationAction) => {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "bytes32" }, { type: "uint256" }], [DESTINATION_ACTION_TYPEHASH, keccak256(action.payload) as Hex, BigInt(action.gasLimit)]))
}


export const hashOrder = (order: IOrder) => {
    return keccak256(
        encodeAbiParameters(
            [
                { type: "bytes32" },
                { type: "bytes32" },
                { type: "bytes32" },
                { type: "address" },
                { type: "uint256" },
                { type: "uint32" },
                { type: "uint32" },
                { type: "uint256" },
                { type: "bytes32" },
                { type: "bytes32" },
            ],
            [
                CRAY_ORDR_TYPE_HASH,
                hashOrderInputs(order.inputs),
                hashOrderOutput(order.output),
                order.sender as Hex,
                order.nonce,
                order.initiateDeadline,
                order.fillDeadline,
                BigInt(order.settlementExpiry),
                order.metadata as Hex,
                hashOrderAction(order.action),
            ]
        )
    )
}

const moveElementToFirst = (elem: any, array: any[]) => {
  /** it moves any specific element from array to index 0 */
  const isExists = array.includes(elem)
  if (!isExists) return array
  return [elem, ...array.filter(a => a !== elem)]
}