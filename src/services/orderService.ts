import mongoose from 'mongoose'
import invariant from 'tiny-invariant'
import { encodeFunctionData, getAddress, Hex, parseUnits } from 'viem'

import { Order, SubOrderType } from '../models/order'

import { isValidToken, tokenSymbolMap } from '../config/tokens'


import { getBalance } from '../apis/helpers/balance'
import { prepareOrder } from '../apis/helpers/order'
import { prepareAllowancePermitData } from '../apis/helpers/permitERC20'
import { generateSwapData } from '../apis/helpers/swap'
import { fullfillOrder, getGasLimit, getOwnerSignOnOrder, submitOrder } from '../apis/helpers/web3'
import { OrderStatus, ReadableStatus } from '../interfaces/enum'
import { IOrderParams, IProcessOrderParams } from '../interfaces/orderParams'
import { getSolverAccountByChainId } from '../utils/getWallets'

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
    // invariant(
    //   isValidToken(destinationToken, destinationChain), //@check eth/BTC addresses
    //   'Invalid Destination Token'
    // )
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
      params?.action?.gasLimit ?
        (await getGasLimit(
          destinationChain,
          receiverAddress as Hex,
          destinationPayload
        )) : undefined
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
        return { message: 'Insufficient balance' }
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
      destinationGasLimit: destinationGasLimit?.toString(),
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
      data: {
        orderId: _id,
        orderHash: orderHashToSign,
        status: OrderStatus.CREATED,
        orderData: stringifiedOrder,
        allowance,
        amount,
        typedOrder: crayOrderDetails
      }
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return { message: 'Error creating order' }
  }
}

export async function processOrder(orderParams: IProcessOrderParams) {
  try {
    console.log(`processing order: ${orderParams.orderHash}`);

    const prepareOrders = orderParams.order.inputs.map((input, index) => {
      let sign: string
      if (orderParams.userSignature[0].chainId) {
        sign = orderParams.userSignature.find(sign => sign.chainId === input.chainId)?.data!
      } else {
        sign = orderParams.userSignature[0].data
      }
      console.log(orderParams.userSignature, sign, input.chainId)
      return submitOrder(input.chainId, {
        order: orderParams.order,
        solverOutputAmount: orderParams.order.output.minAmountOut,
        index,
        userSignature: sign
      }, orderParams.orderHash);
    });
    const results = await Promise.allSettled(prepareOrders)
    console.log(`All orders prepared and submitted for order ${orderParams.orderHash}`);
    console.debug('Source tx Results:', results);
    const sourceChainOrders = results.map((result, index) => {
      const promiseStatus = result.status === 'fulfilled'
      return {
        chainId: orderParams.order.inputs[index].chainId,
        txHash: promiseStatus && result.value.transactionHash,
        txStatus: promiseStatus && result.value.status,
        metadata: JSON.stringify({ error: !promiseStatus && result.reason }),
        gasUsed: promiseStatus && result.value.gasUsed,
        gasPrice: promiseStatus && result.value.effectiveGasPrice,
        type: SubOrderType.INPUT
      }
    })
    // update suborder with type input
    await Order.updateOne({ orderHash: orderParams.orderHash }, { subOrders: sourceChainOrders });
    const sourceChainSuccessfull = sourceChainOrders.length && sourceChainOrders.every(order => order.txStatus);
    // TODO: check if order exists on source chain, funds are locked and order is valid and then only create sign
    if (sourceChainSuccessfull) {
      let swapData;
      console.debug('All source chain suborders successfull:', orderParams.orderHash);
      const solverAddress = getSolverAccountByChainId(orderParams.order.output.chainId).address
      const craySig = await getOwnerSignOnOrder(orderParams.orderHash, solverAddress, orderParams.order.output.chainId);
      // todo: if orderParams.order.output.token is not from tokenList then prepare swapParams
      const isStable = isValidToken(orderParams.order.output.token, orderParams.order.output.chainId)
      if (!isStable) {
        swapData = await generateSwapData({
          chainId: orderParams.order.output.chainId,
          amount: orderParams.order.output.minAmountOut,
          toToken: orderParams.order.output.token,
          receiver: orderParams.order.output.recipient,
          usdc: tokenSymbolMap[`${orderParams.order.output.chainId}-USDC`].tokenAddress
        })
      }
      if (!swapData) {
        console.error(`Swap data not prepared for order ${orderParams.orderHash}`);
        await Order.updateOne({ orderHash: orderParams.orderHash }, { orderState: OrderStatus.CREATED_FAILED });
        return;
      }
      const swapParams = {
        makerAsset: tokenSymbolMap[`${orderParams.order.output.chainId}-USDC`].tokenAddress,
        swapContract: swapData.to,
        swapData: swapData.calldata,
      }
      const fulfilledOndestination = await fullfillOrder(orderParams.order.output.chainId, {
        order: orderParams.order,
        fullfiller: solverAddress,
        outputAmount: orderParams.order.output.minAmountOut
      }, craySig, swapParams, orderParams.orderHash);
      // const fulfilledOndestination = await fulfilledOndestinationTx.wait();
      if (fulfilledOndestination.status) {
        const outSuborder = {
          chainId: orderParams.order.output.chainId,
          txHash: fulfilledOndestination.transactionHash,
          txStatus: fulfilledOndestination.status,
          fulfiller: solverAddress,
          gasUsed: fulfilledOndestination.gasUsed,
          type: SubOrderType.OUTPUT,
        }
        await Order.updateOne({ orderHash: orderParams.orderHash }, { status: ReadableStatus.COMPLETED, orderState: OrderStatus.FULFILLED, $push: { subOrders: outSuborder } });
        console.log(`Fullfill Order ${orderParams.orderHash}, txHash: ${fulfilledOndestination.transactionHash} on chain ${orderParams.order.output.chainId} is ${fulfilledOndestination.status ? 'completed' : 'failed'}`);
        // @todo: settle order
      } else {
        await Order.updateOne({ orderHash: orderParams.orderHash }, { orderState: OrderStatus.FULFILLED_FAILED });
      }
    }
    else {
      await Order.updateOne({ orderHash: orderParams.orderHash }, { orderState: OrderStatus.CREATED_FAILED });
    }
  } catch (error) {
    console.error(`Error at ${error} order for ${orderParams.orderHash}`, error);
  }
}

export const getReadyToProcessOrders = () => Order.find({ status: OrderStatus.SIGNED, signedAt: { $gte: Date.now() - 5 * 1000 * 60 } }).lean()


