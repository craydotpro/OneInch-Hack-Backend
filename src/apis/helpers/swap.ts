import { Address, LimitOrder, MakerTraits } from "@1inch/limit-order-sdk";
import axios from "axios";


import execute1InchApi from "../../../utils/limiter";
import { FusionAddresses } from "../../config/contractAddresses";
const API_URL = `https://api.1inch.dev/swap/v6.1/`;

export async function generateSwapData({chainId, usdc,amount, toToken, receiver}) {
  try {
    const params = {
      from: FusionAddresses[chainId], // Gateway
      src: usdc, // always USDC
      dst: toToken,
      amount: amount,
      receiver: receiver,
      slippage: '1', // 1% slippage
      disableEstimate: true
    };
    // await approveToken(); // Ensure token approval is done first
    console.log('Generating calldata for swap...');
    const response = await execute1InchApi((ONE_INCH_KEY) => axios.get(API_URL + chainId + '/swap', {
      headers: {
        Authorization: `Bearer ${ONE_INCH_KEY}`,
      }, params }));
    console.log('Calldata:', response.data.tx.data);
    console.log('To (target contract):', response.data.tx.to);
    console.log('Value:', response.data.tx.value);
    return {
      calldata: response.data.tx.data,
      to: response.data.tx.to,
      value: response.data.tx.value
    };
  } catch (error) {
    console.error('Error generating calldata:', error);
  }
}

export async function prepareLimitOrder({ chainId, maker, makerAsset, takerAsset, makingAmount, takingAmount }) {
  const expiresIn = BigInt(12000) // 2m
  const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn

  // see MakerTraits.ts
  const makerTraits = MakerTraits.default().withExpiration(expiration)
  const order = new LimitOrder({
    makerAsset: new Address(makerAsset),
    takerAsset: new Address(takerAsset),
    makingAmount: makingAmount,
    takingAmount: takingAmount,
    maker: new Address(maker),
    // salt? : bigint
    // receiver? : Address
  }, makerTraits)
  const typedData = order.getTypedData(chainId)
  return typedData
}
