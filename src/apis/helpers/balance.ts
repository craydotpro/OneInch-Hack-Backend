import { decodeFunctionResult, encodeFunctionData, formatUnits, Hex } from "viem";
import { ActiveChains } from "../../config/chains";
import { BalanceContractAddresses } from "../../config/contractAddresses";

import tokenBalances from "../../abis/tokenBalances";
import { mainChains, testChains } from "../../config/chainConfig";
import { providers } from "../../config/rpcProvider";
import { tokenAddressMap, tokenList } from "../../config/tokens";
import { IAccountBalance, IToken } from "../../interfaces/token";

export const getBalance = async (params: { address: string; sourceTokens?: { address?: string, chainId: number }[], testnet: boolean }) => {
  // @todo: fetch using 1inch api
  let { address, sourceTokens=[] ,testnet} = params
  if (!address) {
    throw new Error('Please provide address to see your account balances.')
  }
  try {
    if(!sourceTokens.length){
      sourceTokens = ActiveChains.filter(chainId=>{
        if(testnet) return chainId in testChains
        else return chainId in mainChains
      }).map(chainId=>({ chainId }))
    }
    const balancePromises = await Promise.allSettled(sourceTokens.map(sourceToken=>{
      let tokens
      if(sourceToken.address){
        tokens = tokenAddressMap[sourceToken.address.toLowerCase()]
      }else{
        tokens = tokenList.filter((token) => token.chainId === sourceToken.chainId)
      }
      tokens = Array.isArray(tokens)?tokens:[tokens]
      if (!tokens.length) return []
      return fetchBalances([address], sourceToken.chainId, tokens)
    }))
    const settledPromises = balancePromises
    const successfulBalances: IAccountBalance[] = settledPromises
      .filter((promise) => promise.status === 'fulfilled')
      .map((promise) => (promise as PromiseFulfilledResult<any>).value)
      .flat()
      .filter((_) => parseFloat(_?.amount) > 0)
      .filter((_) => _)
    return successfulBalances
  } catch (error) {
    console.log('Error while fetching balance', error)
    throw error
  }
}


export const fetchBalances = async (accounts: string[], chainId: number, assets: IToken[]) => {
 
  try {
    const provider = providers[chainId]
    // const balanceResult = await provider.readContract({

    // })
    // const contractAbi = new ethers.Interface(tokenBalancesAbi)

    if (!provider || !BalanceContractAddresses[chainId]) {
      return []
    }

    const tokenAddressAssetMap: { [key: string]: IToken } = {}
    const tokenAddresses = assets.map((t) => {
      const { tokenAddress: tAddress } = t
      tokenAddressAssetMap[tAddress] = t
      return tAddress
    })
    const assetWithBalances: IAccountBalance[] = [] // Fix: Initialize as an empty array of type IBalance
    let accountIdx = 0
    let tokenIdx = 0
    const balancesCallRes = await provider.call({
      account: accounts[0] as `0x${string}`,
      to: BalanceContractAddresses[chainId] as `0x${string}`,
      data: encodeFunctionData({
        abi: tokenBalances,
        functionName: 'balances',
        args: [accounts, tokenAddresses]
      })
    })
    if (!balancesCallRes) {
      return []
    }
    const balances = decodeFunctionResult({
      abi: tokenBalances,
      functionName: 'balances',
      data: balancesCallRes.data as Hex
    })
    if (Array.isArray(balances)) {
      balances.forEach((balance: any) => {
        if (tokenIdx > tokenAddresses.length - 1) {
          tokenIdx = 0
          accountIdx++
        }
        const asset = tokenAddressAssetMap[tokenAddresses[tokenIdx]]
        if (balance !== 0) {
          const formattedBalance = formatUnits(balance, asset.decimals)
          // const usdBalance =
          //   parseFloat(formattedBalance) * parseFloat(asset.usdPrice);
          assetWithBalances.push({
            ...asset,
            chainId: Number(chainId),
            account: accounts[accountIdx],
            balance: balance.toString(),
            amount: formattedBalance,
            usdBalance: asset.isStable ? formattedBalance : '0',
          })
        }
        tokenIdx++
      })
      return assetWithBalances
    }
  } catch (error) {
    console.log('error while fetching balance', error)
  }
}