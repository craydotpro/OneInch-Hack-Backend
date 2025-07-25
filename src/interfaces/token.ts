export interface IToken {
  chainId: number
  tokenAddress: string
  name: string
  symbol: string
  decimals: number
  icon: string
  isStable: boolean
  price?: number
  gasless?: boolean
}


export interface IAccountBalance extends IToken {
  account: string
  balance: string
  amount: string // formatted balance
  usdBalance: string
}

export interface ISpendBalance extends IAccountBalance {
  spend: string
}
