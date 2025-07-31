import axios from 'axios';
// import { Address, Api, FetchProviderConnector, LimitOrder, MakerTraits } from "../../../lib/limit-order-sdk";
import {
  Address,
  FetchProviderConnector,
  MakerTraits,
  Sdk,
} from '@1inch/limit-order-sdk';
import execute1InchApi from '../../../utils/limiter';
import { prepareSLTPPosition } from './sltp';

export async function generateSwapData({
  chainId,
  from,
  srcToken,
  amount,
  toToken,
  receiver,
}) {
  const API_URL = `https://api.1inch.dev/swap/v6.1/`;
  try {
    const params = {
      from,
      src: srcToken,
      dst: toToken,
      amount: amount,
      receiver: receiver,
      slippage: '1', // 1% slippage
      disableEstimate: true,
    };
    // await approveToken(); // Ensure token approval is done first
    console.log('Generating calldata for swap...');
    const response = await execute1InchApi((ONE_INCH_KEY) =>
      axios.get(API_URL + chainId + '/swap', {
        headers: {
          Authorization: `Bearer ${ONE_INCH_KEY}`,
        },
        params,
      })
    );
    return {
      calldata: response.data.tx.data || '0x',
      to: response.data.tx.to || '0x111111125421cA6dc452d289314280a0f8842A65',
      value: response.data.tx.value || 0,
    };
  } catch (error) {
    console.error('Error generating calldata:', error);
  }
}

export async function sellPosition({
  chainId,
  srcToken,
  amount,
  toToken,
  user,
}) {
  try {
  
    const preparePosition = {
      maker: user,
      makerAsset: srcToken,
      makerAmount: amount,
      takerAsset: toToken,
      triggerPrice: 0, // No trigger price for market orders
      deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      isStopLoss: false,
    };
    // const signature = await signSLTPPosition(getSolverAccountByChainId(ChainId.BASE_CHAIN_ID), preparePosition)
    return prepareSLTPPosition(preparePosition);
  } catch (err) {
    console.error('[sellPosition]', err);
    throw new Error('Failed to sell position');
  }
}

export async function prepareLimitOrder({
  chainId,
  maker,
  makerAsset,
  takerAsset,
  makingAmount,
  takingAmount,
}) {
  const expiresIn = BigInt(24 * 60 * 60); // 24h
  const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;

  const makerTraits = MakerTraits.default()
    .allowPartialFills()
    .allowMultipleFills()
    .withExpiration(expiration);
  const sdk = new Sdk({
    authKey: process.env.ONE_INCH_KEY,
    networkId: chainId,
    httpConnector: new FetchProviderConnector(),
  });

  const order = await sdk.createOrder(
    {
      makerAsset: new Address(makerAsset),
      takerAsset: new Address(takerAsset),
      makingAmount: makingAmount,
      takingAmount: takingAmount,
      maker: new Address(maker),
    },
    makerTraits
  );

  const orderHash = order.getOrderHash(chainId);
  const calldata = order.build();
  const extension = order.extension.encode();

  const typedData = order.getTypedData(chainId);
  return {
    limitOrderHash: orderHash,
    limitOrderData: { ...calldata, extension },
    limitOrderTypedData: {
      domain: typedData.domain,
      primaryType: 'Order',
      types: { Order: typedData.types.Order },
      message: typedData.message,
    },
  };
}

export async function submitLimitOrder({
  chainId,
  orderHash,
  order,
  signedOrder,
}) {
  const API_URL = `https://api.1inch.dev/orderbook/v4.0/`;
  const signedLimitOrder = signedOrder[0]?.data || null;
  if (!signedLimitOrder) {
    console.error('No signed limit order found');
    return null;
  }
  try {
    const apiData = {
      orderHash,
      signature: signedLimitOrder,
      data: {
        makerAsset: order.makerAsset.toString(),
        takerAsset: order.takerAsset.toString(),
        maker: order.maker.toString(),
        receiver: order.receiver.toString(),
        makingAmount: order.makingAmount.toString(),
        takingAmount: order.takingAmount.toString(),
        salt: order.salt.toString(),
        extension: order.extension.toString(),
        makerTraits: order.makerTraits.toString(),
      },
    };
    console.log('Submitting limit order with data:', apiData);
    await execute1InchApi((ONE_INCH_KEY) =>
      axios.post(API_URL + chainId, apiData, {
        headers: {
          Authorization: `Bearer ${ONE_INCH_KEY}`,
        },
      })
    );
    return getOrderByHash(chainId, orderHash);
  } catch (error) {
    console.error('Error submitting limit order:', error);
  }
}

export const getOrderByHash = async (chainId, orderHash) => {
  try {
    const API_URL = `https://api.1inch.dev/orderbook/v4.0/`;

    const response = await execute1InchApi((ONE_INCH_KEY) =>
      axios.get(`${API_URL}${chainId}/order/${orderHash}`, {
        headers: {
          Authorization: `Bearer ${ONE_INCH_KEY}`,
        },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching order by hash:', error);
  }
};
