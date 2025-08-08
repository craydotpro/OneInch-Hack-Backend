import { encodeFunctionData, Hex } from "viem"

import erc20Abi from "../../abis/erc20"
import { chains } from "../../config/chainConfig"
import { providers, walletClients } from "../../config/rpcProvider"
import { getTimestampInSeconds } from "../../utils"
import { getRelayerAccountByChainId } from "../../utils/getWallets"


export const MAX_ALLOWANCE_VALUE = 100 * (10 ** 6)
export const MIN_ALLOWANCE_VALUE = 10 ** 10

export const prepareAllowancePermitData = async (params: { spenderAddress: any; tokenAddress: any; ownerAddress: any; value: any; chainId: any }): Promise<any> => {
  const { tokenAddress, ownerAddress, value, chainId, spenderAddress } = params
  const provider = providers[chainId]
  // VerifierContractAddresses
  const erc20Contract = {
    address: tokenAddress,
    abi: erc20Abi,
  } as const

  const allowance = await provider.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  }) as bigint
  if (allowance >= value) {
    return
  }
  const [name, permitVersion, nonce] = await provider.multicall({
    // @ts-ignore
    contracts: [
      {
        ...erc20Contract,
        functionName: 'name',
      },
      {
        ...erc20Contract,
        functionName: 'version',
      },
      {
        ...erc20Contract,
        functionName: 'nonces',
        args: [ownerAddress],
      },
    ]
  })
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  }

  const domainData = {
    name: name.result,
    version: permitVersion.result ?? '1',
    chainId: chainId,
    verifyingContract: tokenAddress,
  }
  const deadline = (getTimestampInSeconds() + 4200).toString()
  const values = {
    owner: ownerAddress,
    spender: spenderAddress,
    value: MAX_ALLOWANCE_VALUE,//value: value
    nonce: nonce.result,
    deadline,
  }
  return { domainData, types, values }
}

export const approveAllowance = (
  payload: {
    chainId: number
    v: number
    r: string
    s: string
    verifyingContract: string
    walletAddress: string
    spenderAddress: string
    value: number
    deadline: string
  }[]
) => {
  return Promise.all(
    payload.map(async ({ chainId, verifyingContract, v, r, s, walletAddress, spenderAddress, value, deadline }) => {
      const provider = providers[chainId]
      const walletClient = walletClients[chainId]
      const account = getRelayerAccountByChainId(chainId)
      const hash = await walletClient.writeContract({
        account,
        address: verifyingContract as Hex,
        abi: erc20Abi,
        functionName: 'permit',
        args: [walletAddress, spenderAddress, value, deadline, v, r, s],
        chain: chains[chainId],
      })
      await provider.waitForTransactionReceipt({ hash })
    })
  )
}

  export const prepareApprove = async (params: {
    tokenAddress: string
    spenderAddress: string
    ownerAddress: string
    value: bigint
    chainId: number
  }) => {
    const destinationCallData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [params.spenderAddress, 100000],
    })
    // const DESTINATION_ACTION_ADDRESS_ARB = '0x789AFb371459EeD6fE3C22F6d71EB58817C64098'

    // const relayRequest = {
    //   chainId: chainId,
    //   targetContract: tokenAddress,
    //   callData: destinationCallData,
    //   actionType: "1inch-swap",
    // };
};