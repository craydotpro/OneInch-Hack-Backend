import { IDestinationAction, IPayloadPayload } from "./order"

export interface IOrderParams {
  senderAddress?: string
  receiverAddress: string
  destinationChain: number
  destinationToken?: string
  amount: string
  orderType: string // p2p, merchant, noncrayreceived
  remark?: string
  minAmountOut?: string // min amount user expect to receive on destination chain
  action?: IDestinationAction // action to be executed on destination chain
  actionPayload?: IPayloadPayload // action to be executed on destination chain
  sourceTokens?: {address?: string, chainId: number}[]
  orderId?: string
  apiId?: string
}

export interface IOrderResponse {
  orderData: string // data to be signed
  approvalData?: string // approval to be signed if needed
}

export interface ISubmitOrderParams {
  signedOrder: [string] // signed order data
  signedApprovalData?: [ISignedApprovalData] // signed approval data if needed
}

export interface ISignedApprovalData {
  chainId: number
  v: number
  r: string
  s: string
  verifyingContract: string
  walletAddress: string
  value: number
  deadline: string
}
