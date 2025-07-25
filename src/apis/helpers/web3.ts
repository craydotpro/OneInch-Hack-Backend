import { Hex } from "viem";
import { providers } from "../../config/rpcProvider";

export function getGasLimit(chain: number, to: Hex, data: Hex) {
  const provider = providers[chain];
  return provider.estimateGas({
    to,
    data
  });
 
}