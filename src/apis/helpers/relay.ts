import { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import relayAbi from "../../abis/relayer"
import { RelayerContractAddresses } from "../../config/contractAddresses"
import { providers, walletClients } from "../../config/rpcProvider"

export const relay = async (params: any) => { 
  const { user, targetContract, actionType, callData, chainId, nonce, v, r, s } = params
  console.log('relay params:', params)
  const provider = providers[chainId]
  const walletClient = walletClients[chainId]
  const pk = process.env.RELAYER_PRIVATE_KEY as Hex
  const account = privateKeyToAccount(pk)
  const { request } = await provider.simulateContract({
    account,
    address: RelayerContractAddresses[chainId] as Hex,
    abi: relayAbi,
    functionName: 'relay',
    args: [user, targetContract, actionType, callData, nonce, v, r, s],
  } as any)
  const hash = await walletClient.writeContract(request)

  // const data = encodeFunctionData({
  //   abi: crayRelayer,
  //   functionName: 'relay',
  //   args: [user, targetContract, actionType, callData, nonce, v, r, s],
  // });

  // const hash = await walletClient.sendTransaction({
  //   account,
  //   to: RelayerContractAddresses[chainId] as Hex as Hex,
  //   data,
  //   gas: 500000, // set high enough to avoid underestimation
  // });
  return provider.waitForTransactionReceipt({ hash })
}
