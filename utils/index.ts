export const _sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));
