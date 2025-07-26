import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";

export const ENABLED_CHAIND_IDS = [
  mainnet.id,
  arbitrum.id,
  polygon.id,
  optimism.id,
];

export const ALLOWED_TOKNS = {
  [mainnet.id]: {
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  },
  [base.id]: {
    WETH: "0x4200000000000000000000000000000000000006",
    WBTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  },
  [arbitrum.id]: {
    WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    WBTC: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
  },
  [optimism.id]: {
    WETH: "0x4200000000000000000000000000000000000006",
    WBTC: "0x68f180fcce6836688e9084f035309e29bf0a2095",
  },
  [polygon.id]: {
    WETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    WBTC: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
  },
};
