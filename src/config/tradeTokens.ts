
const TradeTokensList = {
  ETH: {
    8453: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    42161: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  },
  BTC: {
    8453: '0xbtc_base',
    42161: '0xbtc_arb',
  },
  POL: {
    8453: '0xpol_base',
    42161: '0xpol_arb',
  }
} as const;


export function getTokenAddress(tokenSymbol: keyof typeof TradeTokensList, chainId: number): string {
  const tokenMap = TradeTokensList[tokenSymbol];
  if (!tokenMap) throw new Error(`Token ${tokenSymbol} not supported`);
  const addr = tokenMap[chainId];
  if (!addr) throw new Error(`Chain ${chainId} not supported for token ${tokenSymbol}`);
  return addr;
}