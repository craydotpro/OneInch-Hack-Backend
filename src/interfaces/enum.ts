
export enum OrderStatus {
  INITIALIZED = 'INITIALIZED',
  SIGNED = 'SIGNED',
  DECLINED = 'DECLINED',
  ASSIGNED = 'ASSIGNED',
  CREATED = 'CREATED',
  CREATED_FAILED = 'CREATED_FAILED',
  FULFILLED = 'FULFILLED',
  FULFILLED_FAILED = 'FULFILLED_FAILED',
  SETTLED = 'SETTLED',
  SETTLE_FAILED = 'SETTLE_FAILED',
  FAILED = 'FAILED',
}

export enum ReadableStatus {
  INITIALIZED = 'Initialized',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
}

export enum OrderType {
  P2P = 'p2p',
  DAPP = 'dapp',
  MERCHANT = 'merchant',
  NONCRAYRECEIVED = 'noncrayreceived',
}

export enum OrderInitiatedBy {
  QR = 'QR',
  CPIID = 'CPIID',
}