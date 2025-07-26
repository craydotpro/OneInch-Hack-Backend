import RateLimiter from "async-ratelimiter";
import r from "../redis";
import { _sleep } from ".";
const rateLimiter = new RateLimiter({
  db: r,
  max: 60,
  duration: 1000 * 60,
});
const { ONE_INCH_KEY } = process.env;
const get1InchKey = () => {
  /** use round robin */
  return ONE_INCH_KEY;
};

const handleLimit = async (key) => {
  const id = `1inch:${key}`;
  const status = await rateLimiter.get({ id });
  if (status.remaining) return true;
  await _sleep(1000);
  return handleLimit(key);
};
const execute1InchApi = async (cb) => {
  const key = get1InchKey();
  await handleLimit(key);
  return cb(key);
};
export default execute1InchApi;
