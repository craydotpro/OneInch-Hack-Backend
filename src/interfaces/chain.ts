
export interface IChain {
  chainId: number
  name: string
  logo: string
  currency: {
    address: string
    name: string
    symbol: string
    decimals: number
    icon: string
  }
  isTestnet?: boolean
  rpcs: string[]
  explorer: string
  isActive?: boolean
  etherscan?: {
    api: string
    apiKey: string
  }
}
