import axios from "axios";
import r from "../redis";
import { ENABLED_CHAIND_IDS } from "../constant";
import execute1InchApi from "../utils/limiter";
import { _sleep } from "../utils";
const REFETCH_INTERVAL = 1000 * 20;
const fetchGasByChainId = async (chainId) => {
  let gas = await execute1InchApi((ONE_INCH_KEY) =>
    axios.get("https://api.1inch.dev/gas-price/v1.6/1", {
      headers: {
        Authorization: `Bearer ${ONE_INCH_KEY}`,
      },
    })
  );
  const { maxPriorityFeePerGas, maxFeePerGas } = gas.data.medium;
  return {
    [chainId]: Number(maxPriorityFeePerGas) + Number(maxFeePerGas),
  };
};

const main = async () => {
  try {
    const gas = await Promise.all(
      ENABLED_CHAIND_IDS.map((chain) => fetchGasByChainId(chain))
    );
    const payload = gas.reduce((obj, prop) => {
      return { ...obj, ...prop };
    }, {});
    await r.hset("gasPrice", payload);
  } catch (error) {
    console.log(error);
  } finally {
    await _sleep(REFETCH_INTERVAL);
    main();
  }
};
main();
