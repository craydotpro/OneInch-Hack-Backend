import { IToken } from "../interfaces/token"
import { ActiveChains } from "./chains"

export const tokenList: IToken[] = [
  // usdc
  {
    chainId: 1,
    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDCoin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    tokenAddress: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    chainId: 10,
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    chainId: 56,
    tokenAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    decimals: 18,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'Binance-Peg USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
  {
    chainId: 100,
    tokenAddress: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDC on xDai',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    chainId: 137,
    tokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'Native USD Coin (POS)',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    chainId: 250,
    tokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
  {
    chainId: 324,
    tokenAddress: '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDC Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
  {
    chainId: 1101,
    tokenAddress: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDC Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
    /** VERSION instead of version */
  },
  {
    //base
    tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    chainId: 8453,
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDC',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    //arb
    tokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    chainId: 42161,
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    tokenAddress: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
    chainId: 43114,
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    tokenAddress: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
    chainId: 1313161554,
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
  // usdt
  // {
  //   chainId: 1,
  //   tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether USD',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   tokenAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
  //   chainId: 10,
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether USD',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   chainId: 56,
  //   tokenAddress: '0x55d398326f99059ff775485246999027b3197955',
  //   decimals: 18,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether USD',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   chainId: 100,
  //   tokenAddress: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether on xDai',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   chainId: 137,
  //   tokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether USD',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   tokenAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  //   chainId: 42161,
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether USD',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   tokenAddress: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
  //   chainId: 43114,
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'Tether Token',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // {
  //   tokenAddress: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
  //   chainId: 1313161554,
  //   decimals: 6,
  //   icon: 'https://assets.polygon.technology/tokenAssets/usdt.svg',
  //   name: 'TetherUS',
  //   symbol: 'USDT',
  //   isStable: true,
  // },
  // USDC.E
  // {
  //   tokenAddress: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
  //   chainId: 10,
  //   decimals: 6,
  //   icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  //   name: 'Bridged USD Coin',
  //   symbol: 'USDC.E',
  //   isStable: true,
  // },
  // {
  //   chainId: 137,
  //   tokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  //   decimals: 6,
  //   icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  //   name: 'USDCoin',
  //   symbol: 'USDC.E',
  //   isStable: true,
  // },
  {
    tokenAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    chainId: 42161,
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    name: 'Bridged USDC',
    symbol: 'USDC.E',
    isStable: true,
    gasless: false,
  },
  // USDT.E
  // {
  //   chainId: 43114,
  //   tokenAddress: '0xc7198437980c041c805a1edcba50c1ce5db95118',
  //   name: 'Tether Token - Bridged',
  //   symbol: 'USDT.E',
  //   decimals: 6,
  //   icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  //   isStable: true,
  // },
  // TEST USDC

  {
    // arb testnet
    chainId: 421614,
    tokenAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    //base testnet
    chainId: 84532,
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    // eth
    chainId: 11155111,
    tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },

  {
    // op
    chainId: 11155420,
    tokenAddress: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDC Coin',
    symbol: 'USDC',
    isStable: true,
    gasless: true,
  },
  {
    chainId: 2442,
    tokenAddress: '0x2405692f026e787FF432b88547010ACd7cC9894A',
    decimals: 18,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDCoin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
  //amoy
  {
    chainId: 80002,
    tokenAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDCoin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
  //Europa DeFi & Liquidity Hub
  {
    chainId: 1444673419,
    tokenAddress: '0x6CE77Fc7970F6984eF3E8748A3826972Ec409Fb9',
    decimals: 6,
    icon: 'https://assets.polygon.technology/tokenAssets/usdc.svg',
    name: 'USDCoin',
    symbol: 'USDC',
    isStable: true,
    gasless: false,
  },
]
export const tokenAddressMap = tokenList.reduce((obj: { [key: string]: IToken }, prop: IToken) => {
  obj[prop.tokenAddress.toLowerCase()] = prop
  return obj
}, {})

export const tokenSymbolMap = tokenList.reduce((obj: { [key: string]: IToken }, prop: IToken) => {
  obj[`${prop.chainId}-${prop.symbol}`] = prop
  return obj
}, {})

export const getSupportedTokens = () => {
  return tokenList.filter(token => ActiveChains.includes(token.chainId))
}
export const isValidToken = (tokenAddress:string, chainId:number)=>tokenAddressMap[tokenAddress.toLowerCase()]?.chainId===chainId