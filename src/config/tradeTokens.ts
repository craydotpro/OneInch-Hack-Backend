import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";

export const TradeTokensList = {  
  ETH: {
    [mainnet.id]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    [base.id]: '0x4200000000000000000000000000000000000006',
    [arbitrum.id]:"0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    [optimism.id]:"0x4200000000000000000000000000000000000006",
    [polygon.id]:"0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
  },
  WBTC: {
    [mainnet.id]: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    [base.id]: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    [arbitrum.id]:"0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    [optimism.id]:"0x68f180fcce6836688e9084f035309e29bf0a2095",
    [polygon.id]:"0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
  },
} as const;
export const TRADE_TOKENS_BY_CHAIN = Object.keys(TradeTokensList).reduce((obj,token)=>{
  Object.keys(TradeTokensList[token]).forEach(chainId=>{
    if(!obj[chainId]) obj[chainId] = {}
    obj[chainId][token] = TradeTokensList[token][chainId]
  })
  return obj
},{})
export function getTokenAddress(tokenSymbol: keyof typeof TradeTokensList, chainId: number): string {
  const tokenMap = TradeTokensList[tokenSymbol];
  if (!tokenMap) throw new Error(`Token ${tokenSymbol} not supported`);
  const addr = tokenMap[chainId];
  if (!addr) throw new Error(`Chain ${chainId} not supported for token ${tokenSymbol}`);
  return addr;
}