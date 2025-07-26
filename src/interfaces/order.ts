import { Hex } from 'viem'

export interface IOrder {
  // this is the input of the order
  inputs: IInput[]
  // this is the output of the order
  output: IOutput
  // this is the address of the sender
  sender: string
  // nonce
  nonce: bigint
  // this is the deadline for the order to be initiated
  initiateDeadline: number
  // this is the deadline for the order to be filled
  fillDeadline: number
  // this expiry is for the settlement to happen
  settlementExpiry: number
  // this metadata for storing some info in future
  metadata: string
  // this is the action that the destination chain should execute
  action: IDestinationAction
}

export interface IPayloadPayload {
  abi: any;
  functionName: string;
  args: any[];
}

export interface IInput {
  chainId: number // Use number for TypeScript
  token: string // Use string for address representation
  amount: string // Use string for amount representation
}

export interface IOutput {
  token: string // Use string for address representation
  minAmountOut: string // Use string for amount representation
  recipient: string // Use string for address representation
  chainId: number // Use number for TypeScript
}

export interface IDestinationAction {
  payload: Hex// Use string for bytes representation
  gasLimit: number | bigint // Use number for gas limit
}


export interface IFullFillCrayOrderInput {
  order: IOrder;
  fullfiller: string;
  outputAmount: string;
}
