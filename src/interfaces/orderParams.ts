import { IDestinationAction, IOrder, IPayloadPayload } from "./order"

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
  signedOrder?: {chainId: number, data: string}[] // signed order data
  signedApprovalData?: [ISignedApprovalData] // signed approval data if needed
  signedLimitOrder?: { chainId: number, data: string }[] // signed limit order data if needed
  signedSellOrder?: { chainId: number, data: string }[] // signed sell position data if needed
  signedSltpOrder?:any []
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
  spenderAddress: string
}


export interface IProcessOrderParams {
  orderHash: string
  order: IOrder
  userSignature: [{
    chainId?: number
    data: string
  }]
}
 
export interface ICreateOrder {
  order: IOrder;
  solverOutputAmount: string;
  index: number;
  userSignature: string;
}