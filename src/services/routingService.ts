
export async function prepareSmartBuyRoute(wallet: string, toToken: string, amount: number) {
  // 1. Fetch user balances across chains
  //from which chain to buy
  // 2. Compare prices from 1inch Spot Price API
  // 3. Estimate gas and select best chain

  return {
    estimatedQty: 0.0412,
    destinationChain: 8534,
    destinationToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    swapData: {
      contract: '0x111...',
      data: '0xabc123...'
    },
    routeInfo: {
      ethPrice: 2910,
      gasCost: 0.35,
      fromChain: 8534
    }
  }
}


export function cheapestToken(tokenName: string) {
  // get token {chain, tokenAddress} for given tokenName
  // fetch all token prices from redis 
  
}