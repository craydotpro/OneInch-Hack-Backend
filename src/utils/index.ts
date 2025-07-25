
export const _sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve(true), ms))

export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000)
}
