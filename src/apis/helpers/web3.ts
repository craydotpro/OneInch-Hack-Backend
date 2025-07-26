import { Hex } from "viem";
import fusionAbi from "../../abis/Fusion";
import { chains } from "../../config/chainConfig";
import { FusionAddresses } from "../../config/contractAddresses";
import { providers, walletClients } from "../../config/rpcProvider";
import { IFullFillCrayOrderInput } from "../../interfaces/order";
import { ICreateOrder } from "../../interfaces/orderParams";
import { getOwnerAccountByChainId, getSolverAccountByChainId } from "../../utils/getWallets";
import { hashFullfillOrder } from "./order";

export function getGasLimit(chain: number, to: Hex, data: Hex) {
  const provider = providers[chain];
  return provider.estimateGas({
    to,
    data
  });
}

export async function submitOrder(chainId: number, order: ICreateOrder, orderHash: string) {
  console.log(`Submitting ${orderHash} to chain ${chainId} `);
  const provider = providers[chainId];
  const walletClient = walletClients[chainId];
  const account = getSolverAccountByChainId(chainId)
  const hash = await walletClient.writeContract({
    account,
    address: FusionAddresses[chainId] as Hex,
    abi: fusionAbi,
    functionName: 'createOrder',
    args: [order],
    chain: chains[chainId],
  })
  return provider.waitForTransactionReceipt({ hash })
}

export async function fullfillOrder(chainId: number, input: IFullFillCrayOrderInput, signature: string, swapParams: any, orderHash: string) {
  console.log(`Fullfilling ${orderHash} to chain ${chainId} `);
  const provider = providers[chainId];
  const walletClient = walletClients[chainId];
  const account = getSolverAccountByChainId(chainId)
  const hash = await walletClient.writeContract({
    account,
    address: FusionAddresses[chainId] as Hex,
    abi: fusionAbi,
    functionName: 'fullFillOrder',
    args: [input, signature, swapParams ],
    chain: chains[chainId],
  })
  return provider.waitForTransactionReceipt({ hash })
}

export function getOwnerSignOnOrder(orderHash: string, chainId: number) {
  const account = getOwnerAccountByChainId(chainId);
  const message = hashFullfillOrder({ orderHash, solverAddress: account.address });
  return account.signMessage({ message: { raw: message as Hex } })
}