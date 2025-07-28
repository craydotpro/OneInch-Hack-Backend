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
