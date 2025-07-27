import { model, Schema } from 'mongoose'
import { Hex } from 'viem'
import { OrderInitiatedBy, OrderStatus, OrderType } from '../interfaces/enum'

export enum SubOrderType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export interface IOrderModel extends Document {
  senderAddress?: string
  receiverAddress?: string
  destinationChain?: number
  destinationToken?: string
  sourceTokens?: { address: string, chainId: number }[]
  amount?: string
  orderType?: string
  remark?: string
  minAmountOut?: string
  orderHash?: string
  signedOrder?: [{ chainId: number, data: string }]
  orderData?: string
  subOrders?: any
  status?: string
  readableStatus?: string
  signedAt?: Date
  assignedTo?: string
  assignedAt?: Date
  destinationPayload?: Hex
  destinationGasLimit?: string
  destinationTxHash?: string
  apiId?: string
  currentEvent?: string
  orderInitiatedBy?: string
  errorCode?: string
}


const OrderBreakdownSchema = new Schema(
  {
    type: {
      type: String,
      enum: SubOrderType,
      required: true
    },
    sourceChain: {
      type: Number,
      required: true,
    },
    hash: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.INITIALIZED,
      required: true,
    },
    gasUsed: {
      type: String,
      required: true,
    },
    gasPrice: {
      type: String,
    }
  },
  { _id: false }
)

const OrderScheme = new Schema(
  {
    senderAddress: {
      type: String,
      required: false,
    },
    receiverAddress: {
      type: String,
      required: true,
    },
    destinationChain: {
      type: Number,
      required: true,
    },
    destinationToken: {
      type: String,
      required: true,
    },
    sourceTokens: [{
      address: {
        type: String,
      },
      chainId: {
        type: Number,
        required: true
      },
    }],
    amount: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      enum: OrderType,
      required: false,
    },
    remark: {
      type: String,
      required: false,
    },
    minAmountOut: {
      type: String,
      required: false,
    },
    orderHash: {
      type: String,
      required: false,
    },
    signedOrder: [{
      chainId: {
        type: Number,
        required: false,
      },
      data: {
        type: String,
        required: true,
      }
    }],
    orderData: {
      type: String,
      required: false,
    },
    subOrders: [OrderBreakdownSchema],
    status: {
      type: String,
      enum: OrderStatus,
      required: true,
      default: OrderStatus.INITIALIZED,
    },
    signedAt: {
      type: Date,
      required: false,
    },
    assignedTo: {
      type: String,
      required: false,
    },
    assignedAt: {
      type: Date,
      required: false,
    },
    destinationPayload: {
      type: String,
      required: false,
    },
    destinationGasLimit: {
      type: Number,
      required: false,
    },
    currentEvent: {
      type: String,
    },
    orderInitiatedBy: {
      type: String,
      enum: OrderInitiatedBy,
    },
  },
  {
    timestamps: true,
    strict: false,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
)

OrderScheme.index({ senderUser: 1 })
OrderScheme.index({ receiverUser: 1 })
OrderScheme.index({ orderHash: 1 }, { unique: true })

export const Order = model<IOrderModel>('Order', OrderScheme)
