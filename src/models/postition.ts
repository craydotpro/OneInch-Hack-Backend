import { model, Schema } from 'mongoose'

const SLTPConfigSchema = new Schema({
  enabled: { type: Boolean, required: true },
  price: { type: Number, required: true }
}, { _id: false })

const AdvanceSLTPSchema = new Schema({
  sl: { type: SLTPConfigSchema, required: false },
  tp: { type: SLTPConfigSchema, required: false }
}, { _id: false })

export enum PositionType {
  MARKET = 'market',
  LIMIT = 'limit'
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
    required: true
  },
  amountInUSD: {
    type: String,
    required: true
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
  positionData: {
    type: String,
    required: false
  },
  signature: {
    type: String,
    required: false
  },
  advanceSLTP: {
    type: AdvanceSLTPSchema,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'executed', 'cancelled', 'failed'],
    default: 'pending'
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
