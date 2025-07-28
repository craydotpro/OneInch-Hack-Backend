import axios from "axios";
import r from "../redis";
import { ENABLED_CHAIND_IDS } from "../constant";
import execute1InchApi from "../utils/limiter";
import { _sleep } from "../utils";
import { TRADE_TOKENS_BY_CHAIN } from "../src/config/tradeTokens";
const REFETCH_INTERVAL = 1000 * 60 * 2;
const fetchTokenPriceByChainId = async (chainId) => {
  return execute1InchApi(async (ONE_INCH_KEY) => {
    const tokenAddresses = Object.values(TRADE_TOKENS_BY_CHAIN[chainId]).join(",");
    let tokenPrice = await axios.get(
      `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddresses}`,
      {
        headers: {
          Authorization: `Bearer ${ONE_INCH_KEY}`,
        },
        params: {
          currency: "USD",
        },
      }
    );
    return {
      [chainId]: tokenPrice.data,
    };
  });
};

const main = async () => {
  try {
    const tokenPrice = await Promise.all(
      ENABLED_CHAIND_IDS.map((chain) => fetchTokenPriceByChainId(chain))
    );
    const payload = tokenPrice.reduce((obj, prop) => {
      Object.keys(prop).forEach((chainId) => {
        Object.keys(prop[chainId]).forEach((tokenAddress) => {
          prop[chainId][tokenAddress] = Number(prop[chainId][tokenAddress]);
        });
        obj[chainId] = JSON.stringify(prop[chainId]);
      });
      return obj;
    }, {});
    await r.hset("tokenPrice", payload);
  } catch (error) {
    console.log(error);
  } finally {
    await _sleep(REFETCH_INTERVAL);
    main();
  }
};
main();
