import { model, Schema } from "mongoose";

export enum AdvanceSLTPType {
  SL = 'sl',
  TP = 'tp'
}

const AdvanceSLTPSchema = new Schema({
  positionId: {
    type: Schema.Types.ObjectId,
    ref: 'Position',
    required: true,
  },
  type: {
    type: String,
    enum: AdvanceSLTPType,
    required: true,
  },
  positionData: {
    type: String,
    required: true,
  },
  signedPosition: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['created','active', 'executed', 'cancelled', 'failed'],
    default: 'created'
  },
  executedAt: {
    type: Date,
    required: false
  },
  txHash: {
    type: String,
    required: false
  },
}, {
  timestamps: true,
  strict: false,
  toObject:{ getters: true },
  toJSON: { getters: true }
})

export const AdvanceSLTP = model('AdvanceSLTP', AdvanceSLTPSchema)

