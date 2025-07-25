import {
  Chain,
  arbitrum,
  arbitrumSepolia,
  aurora,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  blast,
  bsc,
  fantom,
  linea,
  mainnet,
  mantle,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonZkEvm,
  polygonZkEvmCardona,
  scroll,
  sepolia,
  skaleEuropaTestnet,
  zksync,
  zora,
} from 'viem/chains'
import { ActiveChains, ChainId } from './chains'

export const mainChains: Record<number, Chain> = {
  [ChainId.ARBITRUM_CHAIN_ID]: arbitrum,
  [ChainId.OPTIMISM_CHAIN_ID]: optimism,
  [ChainId.BASE_CHAIN_ID]: base,

  [ChainId.BSC_CHAIN_ID]: bsc,
  [ChainId.MAINNET_CHAIN_ID]: mainnet,
  [ChainId.POLYGON_CHAIN_ID]: polygon,
  [ChainId.FANTOM_CHAIN_ID]: fantom,
  [ChainId.AVAX_CHAIN_ID]: avalanche,
  [ChainId.AURORA_CHAIN_ID]: aurora,
  [ChainId.ZKSYNC_ERA_CHAIN_ID]: zksync,
  [ChainId.ZORA_CHAIN_ID]: zora,
  [ChainId.LINEA_CHAIN_ID]: linea,
  [ChainId.MANTLE_CHAIN_ID]: mantle,
  [ChainId.SCROLL_CHAIN_ID]: scroll,
  [ChainId.BLAST_CHAIN_ID]: blast,
  [ChainId.POLYGON_ZKEVM_CHAIN_ID]: polygonZkEvm,
}

export const testChains: Record<number, Chain> = {
  [ChainId.ARB_SEPOLIA_CHAIN_ID]: arbitrumSepolia,
  [ChainId.BASE_SEPOLIA_CHAIN_ID]: baseSepolia,
  [ChainId.OP_SEPOLIA_CHAIN_ID]: optimismSepolia,

  [ChainId.ETH_SEPOLIA_CHAIN_ID]: sepolia,
  [ChainId.AVAX_FUJI_CHAIN_ID]: avalancheFuji,
  [ChainId.POLYGON_ZKEVM_CARDONA_CHAIN_ID]: polygonZkEvmCardona,
  [ChainId.POLYGON_AMOY_CHAIN_ID]: polygonAmoy,
  [ChainId.EUROPA_SKALE]: skaleEuropaTestnet 
}
Object.values(mainChains).forEach((chain:any)=>{
  /** add chainId prop in chains */
  chain.chainId = chain.id
})
Object.values(testChains).forEach((chain:any)=>{
  /** add chainId prop in chains */
  chain.chainId = chain.id
})
export const TESTNET_CHAINIDS = Object.values(testChains).map(_=>_.id)
export const MAINNET_CHAINIDS = Object.values(mainChains).map(_=>_.id)
export const chains = {
  ...mainChains,
  ...testChains,
}
export const activeChains = Object.keys(chains).filter(chainId=>ActiveChains.includes(Number(chainId))).reduce((obj, chainId)=>{
  obj[chainId] = chains[Number(chainId)]
  return obj
},{} as Record<string, Chain>)
export const activeChainIds = new Set(Object.keys(activeChains))