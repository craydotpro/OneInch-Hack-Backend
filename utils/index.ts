import r from "../redis";

export const _sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));
export const getTokenPrice = async (chainId) =>
  JSON.parse((await r.hget("tokenPrice", chainId)) as any) as Record<
    string,
    number
  >;
