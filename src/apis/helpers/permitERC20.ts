import { Hex } from "viem"
import erc20 from "../../abis/erc20"
import { VerifierContractAddresses } from "../../config/contractAddresses"
import { providers, walletClients } from "../../config/rpcProvider"
import { getTimestampInSeconds } from "../../utils"
import { getRelayerAccountByChainId } from "../../utils/getWallets"


export const MAX_ALLOWANCE_VALUE = 100 * (10 ** 6)
export const MIN_ALLOWANCE_VALUE = 10 ** 10

export const prepareAllowancePermitData = async (params: { tokenAddress: any; ownerAddress: any; value: any; chainId: any }): Promise<any> => {
  const { tokenAddress, ownerAddress, value, chainId } = params
  const provider = providers[chainId]
  // VerifierContractAddresses
  const spenderAddress = VerifierContractAddresses[chainId]
  const erc20Contract = {
    address: tokenAddress,
    abi: erc20,
  } as const

  const allowance = await provider.readContract({
    address: tokenAddress,
    abi: erc20,
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
    value: number
    deadline: string
  }[]
) => {
  return Promise.all(
    payload.map(async ({ chainId, verifyingContract, v, r, s, walletAddress, value, deadline }) => {
      const provider = providers[chainId]
      const walletClient = walletClients[chainId]
      const account = getRelayerAccountByChainId(chainId)
      const hash = await walletClient.writeContract({
        account,
        address: verifyingContract as Hex,
        abi: erc20,
        functionName: 'permit',
        args: [walletAddress, VerifierContractAddresses[chainId], value, deadline, v, r, s],
      })
      await provider.waitForTransactionReceipt({ hash })
    })
  )
};