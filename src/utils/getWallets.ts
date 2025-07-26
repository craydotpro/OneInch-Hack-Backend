// @todo: remove ethers
import { Account, Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { chains } from "../config/chainConfig"
import { providers } from "../config/rpcProvider"
[
    process.env.TESTNET_SOLVER_PRIVATE_KEY,
    process.env.MAINNET_SOLVER_PRIVATE_KEY,
    process.env.TESTNET_OWNER_PRIVATE_KEY, 
    process.env.MAINNET_OWNER_PRIVATE_KEY,
    process.env.TESTNET_RELAYER_PRIVATE_KEY,
    process.env.MAINNET_RELAYER_PRIVATE_KEY
].forEach(key=>{
    if(!key){
        throw Error("Missing private keys")
    }
})

const WALLETS = {
    solver:{},
    owner:{},
    relayer:{}
} as any

    Object.keys(providers).reduce((obj,chainId)=>{
        const testnet = chains[chainId]?.testnet || false
        const solverPrivateKey = testnet ? process.env.TESTNET_SOLVER_PRIVATE_KEY!: process.env.MAINNET_SOLVER_PRIVATE_KEY!
        const ownerPrivateKey = testnet ? process.env.TESTNET_OWNER_PRIVATE_KEY! : process.env.MAINNET_OWNER_PRIVATE_KEY!
        const relayerPrivateKey = testnet ? process.env.TESTNET_RELAYER_PRIVATE_KEY! : process.env.MAINNET_RELAYER_PRIVATE_KEY!
        obj.solver[chainId] = privateKeyToAccount(solverPrivateKey as Hex)
        obj.owner[chainId] = privateKeyToAccount(ownerPrivateKey as Hex)
        obj.relayer[chainId] = privateKeyToAccount(relayerPrivateKey as Hex)

        return obj
    }, WALLETS)


export const getRelayerAccountByChainId = (chainId: number): Account => {
    if (!(chainId in WALLETS.relayer)) throw new Error(`invalid ChainId`)
    return WALLETS.relayer[chainId]
}

export const getSolverAccountByChainId =  (chainId:number): Account => {
    if(!(chainId in WALLETS.solver)) throw new Error(`invalid ChainId`)
    return WALLETS.solver[chainId]    
}
export const getOwnerAccountByChainId =  (chainId:number): Account => {
    console.log(`######fetched  ${WALLETS.owner[chainId]    .address}`)
    if(!(chainId in WALLETS.owner)) throw new Error('invalid ChainId')
    return WALLETS.owner[chainId]    

}