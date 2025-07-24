import { createPublicClient, createWalletClient, http } from 'viem';
import { arbitrum, arbitrumSepolia, base, baseSepolia, mainnet, optimism, optimismSepolia, polygon, polygonAmoy, sepolia, skaleEuropaTestnet } from 'viem/chains';
import { ChainId } from './chains';
require('dotenv').config()

export const providers = {
  [ChainId.ETH_SEPOLIA_CHAIN_ID]: createPublicClient({
    chain: sepolia,
    transport: http(process.env.RPC_URL_ETH_SEPOLIA || undefined)
  }),
  [ChainId.OP_SEPOLIA_CHAIN_ID]: createPublicClient({
    chain: optimismSepolia,
    transport: http(process.env.RPC_URL_OP_SEPOLIA || undefined)
  }),
  [ChainId.ARB_SEPOLIA_CHAIN_ID]: createPublicClient({
    chain: arbitrumSepolia,
    transport: http(process.env.RPC_URL_ARB_SEPOLIA || undefined)
  }),
  [ChainId.POLYGON_AMOY_CHAIN_ID]: createPublicClient({
    chain: polygonAmoy,
    transport: http(process.env.RPC_URL_POLYGON_AMOY || undefined)
  }),
  [ChainId.BASE_SEPOLIA_CHAIN_ID]: createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_URL_BASE_SEPOLIA || undefined)
  }),


  [ChainId.EUROPA_SKALE]: createPublicClient({
    chain: skaleEuropaTestnet,
    transport: http(process.env.RPC_URL_EUROPA_SKALE || undefined)
  }),
  ////
  [ChainId.OPTIMISM_CHAIN_ID]: createPublicClient({
    chain: optimism,
    transport: http(process.env.RPC_URL_OP || undefined)
  }),
  [ChainId.ARBITRUM_CHAIN_ID]: createPublicClient({
    chain: arbitrum,
    transport: http(process.env.RPC_URL_ARB || undefined)
  }),
  [ChainId.BASE_CHAIN_ID]: createPublicClient({
    chain: base,
    transport: http(process.env.RPC_URL_BASE || undefined)
  }),
  [ChainId.MAINNET_CHAIN_ID]: createPublicClient({
    chain: mainnet,
    transport: http(process.env.RPC_URL_ETH || undefined)
  }),
  [ChainId.POLYGON_CHAIN_ID]: createPublicClient({
    chain: polygon,
    transport: http(process.env.RPC_URL_POLYGON || undefined)
  }),
}

export const walletClients = {
  [ChainId.OP_SEPOLIA_CHAIN_ID]: createWalletClient({
    chain: optimismSepolia,
    transport: http(process.env.RPC_URL_OP_SEPOLIA || undefined)
  }),
  [ChainId.ARB_SEPOLIA_CHAIN_ID]: createWalletClient({
    chain: arbitrumSepolia,
    transport: http(process.env.RPC_URL_ARB_SEPOLIA || undefined)
  }),
  [ChainId.BASE_SEPOLIA_CHAIN_ID]: createWalletClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_URL_BASE_SEPOLIA || undefined)
  }),
  [ChainId.ETH_SEPOLIA_CHAIN_ID]: createWalletClient({
    chain: sepolia,
    transport: http(process.env.RPC_URL_ETH_SEPOLIA || undefined)
  }),
  [ChainId.POLYGON_AMOY_CHAIN_ID]: createWalletClient({
    chain: polygonAmoy,
    transport: http(process.env.RPC_URL_POLYGON_AMOY || undefined)
  }),
  [ChainId.EUROPA_SKALE]: createWalletClient({
    chain: skaleEuropaTestnet,
    transport: http(process.env.RPC_URL_EUROPA_SKALE || undefined)
  }),
  
  // Mainnet chains
  [ChainId.OPTIMISM_CHAIN_ID]: createWalletClient({
    chain: optimism,
    transport: http(process.env.RPC_URL_OP || undefined)
  }),
  [ChainId.ARBITRUM_CHAIN_ID]: createWalletClient({
    chain: arbitrum,
    transport: http(process.env.RPC_URL_ARB || undefined)
  }),
  [ChainId.BASE_CHAIN_ID]: createWalletClient({
    chain: base,
    transport: http(process.env.RPC_URL_BASE || undefined)
  }),
  [ChainId.MAINNET_CHAIN_ID]: createWalletClient({
    chain: mainnet,
    transport: http(process.env.RPC_URL_ETH || undefined)
  }),
  [ChainId.POLYGON_CHAIN_ID]: createWalletClient({
    chain: polygon,
    transport: http(process.env.RPC_URL_POLYGON || undefined)
  }),
}