import { model, Schema } from 'mongoose'

const SLTPConfigSchema = new Schema({
  enabled: { type: Boolean, default: false, required: true },
  price: { type: Number, required: true }
}, { _id: false })

const AdvanceSLTPSchema = new Schema({
  sl: { type: SLTPConfigSchema, required: false },
  tp: { type: SLTPConfigSchema, required: false }
}, { _id: false })

export enum PositionType {
  MARKET = 'market',
  LIMIT = 'limit',
  BUY = 'buy',
  SELL= 'sell',
}

export enum PositionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}


const PositionSchema = new Schema({
  type: {
    type: String,
    enum: PositionType,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  },
  toToken: {
    type: String,
    enum: ['ETH', 'WBTC'],
    required: false
  },
  sellingToken: {
    type: String,
    enum: ['ETH', 'WBTC'],
    required: false
  },
  orderType: {
    type: String,
    enum: PositionType,
    default: PositionType.BUY
  },
  fromTokenAddress: {
    type: String,
    required: false
  },
  toTokenAddress: {
    type: String,
    required: false
  },
  executeOnChain: {
    type: Number,
    required: false
  },
  amountInUSD: {
    type: String,
    required: false
  },
  qty: {
    type: String,
    required: false
  },
  avgPrice: {
    type: Number,
    required: false
  },
  slippage: {
    type: Number,
    default: 0.5
  },
  triggerPrice: { // limit order price
    type: Number,
    required: false
  },

  signedLimitOrder: [{
    chainId: {
      type: Number,
      required: false,
    },
    data: {
      type: String,
      required: true,
    }
  }],
  limitOrderHash: {
    type: String,
    required: false
  },
  limitOrderData: {
    type: String,
    required: false
  },
  limitOrderTypedData: {
    type: String,
    required: false
  },
  sellPositionTypedData: {
    type: String,
    required: false
  },
  signedSellPosition: [{
    chainId: {
      type: Number,
      required: false,
    },
    data: {
      type: String,
      required: true,
    }
  }],
  advanceSLTP: {
    type: AdvanceSLTPSchema,
    required: false
  },
  status: {
    type: String,
    enum: PositionStatus,
    default: PositionStatus.PENDING
  },
  txHash: {
    type: String,
    required: false
  },
  orderHash: {
    type: String,
    ref: 'Order',
    required: false
  },
  routeInfo: {
    type: Schema.Types.Mixed,
    required: false
  },
  executedAt: {
    type: Date,
    required: false
  },
  expiresAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
})

export const Position = model('Position', PositionSchema)
