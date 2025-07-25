import mongoose from 'mongoose'
import invariant from 'tiny-invariant'
import { encodeFunctionData, getAddress, Hex, parseUnits } from 'viem'

import { Order } from '../models/order'

import { isValidToken, tokenSymbolMap } from '../config/tokens'
import { IOrderParams } from '../interfaces'

import { getBalance } from '../apis/helpers/balance'
import { prepareOrder } from '../apis/helpers/order'
import { prepareAllowancePermitData } from '../apis/helpers/permitERC20'
import { getGasLimit } from '../apis/helpers/web3'
import { OrderStatus, ReadableStatus } from '../interfaces/enum'

require('dotenv').config()

// ---------- New methods ------------------

export async function createOrder(
  params: IOrderParams,
  testnet: boolean = false
) {
  try {
    let {
      senderAddress,
      receiverAddress,
      destinationChain,
      destinationToken,
      sourceTokens = [],
      amount,
      remark,
      orderType,
      action,
      actionPayload
    } = params

    destinationToken = getAddress(
      destinationToken ||
        tokenSymbolMap[`${destinationChain}-USDC`].tokenAddress
    )
    invariant(
      isValidToken(destinationToken, destinationChain),
      'Invalid Destination Token'
    )
    if (sourceTokens?.length) {
      sourceTokens.forEach((sourceToken) => {
        let srcToken = getAddress(
          sourceToken.address ||
            tokenSymbolMap[`${sourceToken.chainId}-USDC`].tokenAddress
        )
        invariant(
          isValidToken(srcToken, sourceToken.chainId),
          'Invalid Source Token'
        )
      })
    }
    let minAmount =
      params?.minAmountOut ||
      parseUnits(
        amount,
        tokenSymbolMap[`${destinationChain}-USDC`].decimals
      ).toString()
    const _id = new mongoose.Types.ObjectId()
    let orderHashToSign = `cray-temp-${new Date().getTime()}`
    let crayOrderDetails
    let stringifiedOrder
    let destinationPayload = actionPayload
      ? encodeFunctionData(actionPayload)
      : '0x'
    let destinationGasLimit =
      params?.action?.gasLimit ??
      (await getGasLimit(
        destinationChain,
        receiverAddress as Hex,
        destinationPayload
      ))
    if (!action?.payload && actionPayload) {
      action = {
        payload: destinationPayload,
        gasLimit: destinationGasLimit
      }
    }
    if (senderAddress) {
      const balances = await getBalance({
        address: senderAddress,
        sourceTokens,
        testnet
      })
      if (!balances || !balances.length) {
        return 'Insufficient balance'
      }

      // validate order else return null
      const { typedOrder, orderHash } = await prepareOrder(
        _id,
        { ...params, destinationToken, minAmountOut: minAmount },
        balances
      )
      orderHashToSign = orderHash
      crayOrderDetails = typedOrder
      stringifiedOrder = JSON.stringify(typedOrder.message, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    }
    await Order.create({
      _id,
      senderAddress,
      receiverAddress,
      destinationChain,
      sourceTokens,
      destinationToken,
      amount,
      remark,
      orderType,
      isSponsered: true,
      status: OrderStatus.INITIALIZED,
      readableStatus: ReadableStatus.INITIALIZED,
      minAmountOut: minAmount,
      orderHash: orderHashToSign,
      destinationPayload,
      destinationGasLimit,
      orderData: stringifiedOrder,
      apiId: 'crow' // apiId: req.apiObject._id, //@sayli
    })

    const allowance =
      crayOrderDetails?.message &&
      (
        await Promise.all(
          crayOrderDetails.message.inputs.map(async (input: any) =>
            prepareAllowancePermitData({
              tokenAddress: input.token,
              ownerAddress: senderAddress,
              value: Number(input.amount),
              chainId: input.chainId
            })
          )
        )
      ).filter((_: any) => _)

    return {
      orderId: _id,
      orderHash: orderHashToSign,
      status: OrderStatus.CREATED,
      orderData: stringifiedOrder,
      allowance,
      amount,
      typedOrder: crayOrderDetails
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return 'Error creating order'
  }
}

export const getReadyToProcessOrders = () => Order.find({ status: OrderStatus.SIGNED, signedAt: { $gte: Date.now() - 5 * 1000 * 60 } }).lean()


