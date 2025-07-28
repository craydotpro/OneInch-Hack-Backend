import r from "../redis";
import { TradeTokensList } from "../src/config/tradeTokens";

export const _sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));
export const getTokenPrice = async (chainId) =>
  JSON.parse((await r.hget("tokenPrice", chainId)) as any) as Record<
    string,
    number
  >;

export const getTokensPriceByChainId = async (data) =>{
  let allTokenPrices =await r.hgetall("tokenPrice")
  let tokens = Object.keys(data).map(chainId=>{
    if(!allTokenPrices[chainId]) return
    const tokenPricesById = JSON.parse(allTokenPrices[chainId])
    const requestedTokenAddress = data[chainId]
    return {
      chainId,
      tokenAddress: requestedTokenAddress,
      price: tokenPricesById[requestedTokenAddress]
    }
  }).filter(_=>_)
  return tokens
}
export async function cheapestToken(tokenName: string) {
  const tokens = TradeTokensList[tokenName]
  const tokensPrices = await getTokensPriceByChainId(tokens)
   tokensPrices.sort((a,b)=>a.price-b.price)
   return tokensPrices[0]
}
