import axios from 'axios';
import { Request, Response, Router } from 'express';
import { parseUnits } from 'viem';
import { ENABLED_CHAIND_IDS } from '../../constant';
import r from '../../redis';
import execute1InchApi from '../../utils/limiter';
import { ActiveChains, ChainId } from '../config/chains';
import { VerifierContractAddresses } from '../config/contractAddresses';
import { isValidToken, MAINNET_USDC, tokenSymbolMap } from '../config/tokens';
import { getTokenAddress, TRADE_TOKENS_BY_CHAIN } from '../config/tradeTokens';
import { OrderStatus, ReadableStatus } from '../interfaces/enum';
import { ISubmitOrderParams } from '../interfaces/orderParams';
import { AdvanceSLTP } from '../models/advancePositions';
import { Order } from '../models/order';
import { Position, PositionStatus, PositionType } from '../models/postition';
import { processAdvanceOrder, storeSLTPPositions } from '../services/advanceOrderService';
import { createOrder, processOrder } from '../services/orderService';
import { approveAllowance } from './helpers/permitERC20';
import { prepareSLTPPosition } from './helpers/sltp';
import { generateSwapData, prepareLimitOrder, sellPosition, submitLimitOrder } from './helpers/swap';
import { executeSLTPPositions } from './helpers/web3';
import insightRouter from './insight';

const router = Router({ mergeParams: true });

router.get('/health', async (_, res) => {
  res.send('ok');
});

// POST /api/position/prepare
router.post('/prepare-buy', async (req: Request, res: Response) => {
  try {
    // buy / (sell- relayer)
    const {
      userAddress,
      toToken, // ETH
      type, //market/limit
      amountInUSD,
      amountInTokens = '0.000023',
      triggerPrice, // if limit order
      advanceSLTP,
    } = req.body;

    // get user balance
    // get gasprice
    // get token price

    // const route = await prepareSmartBuyRoute(userAddress, toToken, amountInUSD) //return destination details
    // // create and store orderHash
    let limitOrderData;
    let limitOrderHash;
    let limitOrderTypedData;
    let sltpOrderTypedData;
    const buyingChain = ChainId.BASE_CHAIN_ID;
    const toTokenAddress = getTokenAddress(toToken, buyingChain);
    const payParams = {
      senderAddress: userAddress,
      receiverAddress: userAddress,
      amount: amountInUSD, // amount in USD
      destinationChain: buyingChain, // comes from route
      destinationToken: toTokenAddress, // comes from route
      orderType: 'dapp', // dapp
    };
    if (type === 'limit') {
      // @urgent @todo create order only if balance is fragmented:
      payParams.destinationToken = tokenSymbolMap[
        `${buyingChain}-USDC`
      ].tokenAddress;
      (
        { limitOrderHash, limitOrderTypedData, limitOrderData } =
          await prepareLimitOrder({
            chainId: buyingChain,
            maker: userAddress,
            makerAsset: tokenSymbolMap[`${buyingChain}-USDC`].tokenAddress,
            takerAsset: toTokenAddress,
            makingAmount: parseUnits(amountInUSD.toString(), 6), // assuming USDC has 6 decimals
            takingAmount: parseUnits(
              (amountInUSD / triggerPrice).toString(),
              18
            ),
          }));
    }
    // Create Order
    const { data, message } = await createOrder(payParams, type) // if destination token is not stable, prep 1inch swap data
    if (message) {
      return res.status(500).json({ error: message })
    }
    const positionParams = {
      userAddress,
      toToken,
      type,
      amountInUSD,
      orderType : PositionType.BUY,
      qty: amountInTokens,
      toTokenAddress,
      slippage: 0.5,
      triggerPrice,
      advanceSLTP,
      executeOnChain: buyingChain,
      deadline: Math.floor(Date.now() / 1000) + 300,
      orderHash: data?.orderHash || '0x',
      limitOrderHash,
      limitOrderData: JSON.stringify(limitOrderData),
      limitOrderTypedData: JSON.stringify(limitOrderTypedData),
    };
    const position = await Position.create(positionParams);
    if (position.advanceSLTP) {
       sltpOrderTypedData = await processAdvanceOrder(position);
    }
    res.json({
      result: { ...data, limitOrderTypedData, sltpOrderTypedData, positionId: position._id },
      message: 'Position prepared successfully',
    });
  } catch (err) {
    console.error('[preparePosition]', err);
    res.status(500).json({ error: 'Failed to prepare position' });
  }
});

router.post('/prepare-sell', async (req: Request, res: Response) => {
  try {
    const {
      userAddress,
      sellingToken, // ETH
      sellingChain = ChainId.BASE_CHAIN_ID, // BASE
      type, //market/limit
      amountInTokens,
      triggerPrice, // if limit order
      advanceSLTP,
    } = req.body;
    const sellingTokenAddress = getTokenAddress(sellingToken, sellingChain);
    const usdc = tokenSymbolMap[`${sellingChain}-USDC`].tokenAddress
    const sellTypedData = await sellPosition({
      chainId: sellingChain,
      srcToken: sellingTokenAddress,
      amount: amountInTokens,
      toToken: usdc,
      user: userAddress,
    })
    const positionParams = {
      userAddress,
      toToken: usdc,
      type,
      // amountInUSD , // @todo: calculate amount in USD
      qty: amountInTokens,
      fromTokenAddress: sellingTokenAddress,
      sellingToken,
      orderType: PositionType.SELL,
      executeOnChain: sellingChain,
      slippage: 0.5,
      triggerPrice,
      advanceSLTP,
      deadline: Math.floor(Date.now() / 1000) + 3600,
      sellPositionTypedData: JSON.stringify(sellTypedData),
      // limitOrderHash,
      // limitOrderData: JSON.stringify(limitOrderData),
      // limitOrderTypedData: JSON.stringify(limitOrderTypedData),
    };

    const position = await Position.create(positionParams);
      if (position.advanceSLTP) {
       sltpOrderTypedData = await processAdvanceOrder(position);
    }
    return res.json({
      result: { positionId: position._id, sellTypedData },
      message: 'Sell Position prepared, Please Sign the position',
    });
  } catch (err) {
    console.error('[prepare sell Position]', err);
    res.status(500).json({ error: 'Failed to sell position' });
  }
});

// POST /api/position/submit
router.post('/submit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submitOrderParams: ISubmitOrderParams = req.body;
    const { signedOrder, signedApprovalData, signedLimitOrder, signedSellPosition, signedSltpOrder } =
      submitOrderParams;
    const position = await Position.findById(id);
    let orderStatus;
    let orderInfo;
    const updatePayload: any = {
      status: PositionStatus.PENDING,
      qty: position.qty
    };
 
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    if (signedApprovalData && signedApprovalData.length) {
      await approveAllowance(signedApprovalData);
    }
    if (signedSellPosition && signedSellPosition.length) {
      await Position.findByIdAndUpdate(
        id,
        {
          $set: {
            signedSellPosition,
          },
        },
        {
          new: true,
        }
      );
      const swapData = await generateSwapData({
        chainId: position.executeOnChain,
        from: position.userAddress,
        srcToken: position.fromTokenAddress,
        toToken: position.toTokenAddress,
        amount: position.qty,
        receiver: position.userAddress,
      });
      const p = position.sellPositionTypedData ? JSON.parse(position.sellPositionTypedData) : {};
      const pp = p.message
      const preparePosition = {
        ...pp,
        swapContract: swapData.to,
        swapData: swapData.calldata,
      }
      const txHash = await executeSLTPPositions(position.executeOnChain, preparePosition, signedSellPosition[0].data);
      updatePayload.status = txHash?.status ? PositionStatus.EXECUTED : PositionStatus.FAILED;
    }
    if (signedOrder && signedOrder.length) {
      const updateSignedOrder = await Order.findOneAndUpdate(
        {
          orderHash: position.orderHash,
          status: OrderStatus.INITIALIZED,
        },
        {
          $set: {
            signedOrder,
            readableStatus: ReadableStatus.PROCESSING,
            status: OrderStatus.SIGNED,
            signedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );
      if (!updateSignedOrder) {
        return res
          .status(404)
          .json({ error: 'Order not found or already processed' });
      }
      const { orderStatus, quantity } = await processOrder({
        orderHash: position.orderHash,
        order: JSON.parse(updateSignedOrder.orderData),
        userSignature: updateSignedOrder.signedOrder,
      });
      updatePayload.status = orderStatus ? PositionStatus.EXECUTED : PositionStatus.FAILED;
      updatePayload.qty = quantity || position.qty;
    }
    
    if (signedLimitOrder) {
      const updatePosition = await Position.findByIdAndUpdate(
        id,
        {
          $set: {
            signedLimitOrder,
          },
        },
        {
          new: true,
        }
      );
      // call 1inch submit api
      orderInfo = await submitLimitOrder({
        chainId: position.executeOnChain,
        orderHash: updatePosition.limitOrderHash,
        order: JSON.parse(updatePosition.limitOrderData),
        signedOrder: signedLimitOrder,
      });
      updatePayload.status = orderInfo ? PositionStatus.ACTIVE : PositionStatus.FAILED;
    }
   
    if (signedSltpOrder.length) {
      const state = await storeSLTPPositions(id, signedSltpOrder);
      updatePayload['advanceSLTP.tp.enabled'] = state;
      updatePayload['advanceSLTP.sl.enabled'] = state;
    }
    await Position.updateOne(
      { _id: id },
      {
        $set: updatePayload,
      },
    )

    if (!orderStatus && !orderInfo) {
      return res.status(400).json({
        error: `something went wrong in submitting position, Please try again later`,
      });
    }
    res.json({
      message: 'Position submitted successfully',
    });
  } catch (err) {
    console.error('submitPosition', err);
    res.status(500).json({ error: 'Failed to submit position' });
  }
});

// POST set advance SLTP
router.post('/sltp/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, triggerPrice } = req.body;
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    // Check if advanceSLTP already exists
    // prepare data to sign
    const preparePosition = {
      maker: position.userAddress,
      makerAsset: getTokenAddress(position.toToken, position.executeOnChain),
      makerAmount: position.amountInUSD,
      takerAsset: tokenSymbolMap[`${position.executeOnChain}-USDC`].tokenAddress,
      triggerPrice,
      deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      isStopLoss: type === 'sl',
    };
    // const signature = await signSLTPPosition(getSolverAccountByChainId(ChainId.BASE_CHAIN_ID), preparePosition)
    const advanceSLTP = prepareSLTPPosition(preparePosition);
    await AdvanceSLTP.create({
      positionId: position._id,
      type,
      positionData: JSON.stringify(advanceSLTP),
    });

    res.json({
      message: 'Please sign the SL/TP position',
      result: { positionId: position._id, data: advanceSLTP },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit position' });
  }
});

router.post('/sltp/submit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { signedPosition } = req.body;
    const advanceSLTP = await AdvanceSLTP.findById(id);
    if (!advanceSLTP) {
      return res.status(404).json({ error: 'Advance SL/TP not found' });
    }
    if (!signedPosition) {
      return res
        .status(400)
        .json({ error: 'Signed position data is required' });
    }
    // Update the advance SL/TP with the signed position
    advanceSLTP.signedPosition = signedPosition;
    advanceSLTP.status = 'active'; // Set status to active
    await advanceSLTP.save();
    res.json({
      message: 'SL/TP set successfully',
    });
  } catch (err) {
    console.error('submitSLTPPosition', err);
    return res.status(500).json({ error: 'Failed to submit SL/TP position' });
  }
});

router.get('/balance/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    let balance = await Promise.all(
      ENABLED_CHAIND_IDS.map(async (chainId) => {
        let tokens = await execute1InchApi((ONE_INCH_KEY) =>
          axios.get(
            `https://api.1inch.dev/balance/v1.2/${chainId}/aggregatedBalancesAndAllowances/${
              VerifierContractAddresses[chainId] || walletAddress
            }`,
            {
              headers: {
                Authorization: `Bearer ${ONE_INCH_KEY}`,
              },
              params: {
                wallets: walletAddress,
                filterEmpty: 'true',
              },
            }
          )
        );
        tokens.data.forEach((token) => {
          token.chainId = chainId;
        });
        return tokens.data.filter((token) =>
          isValidToken(token.address, chainId)
        );
      })
    );
    balance = balance.flat();
    res.send(balance);
  } catch (err) {
    console.error('[balance]', err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

router.get(
  '/balance/:walletAddress/:type',
  async (req: Request, res: Response) => {
    try {
      const { walletAddress, type = 'STABLE_COINS' } = req.params;
      let balance = await Promise.all(
        ActiveChains.map(async (chainId) => {
          let tokens = await execute1InchApi((ONE_INCH_KEY) =>
            axios.get(
              `https://api.1inch.dev/balance/v1.2/${chainId}/aggregatedBalancesAndAllowances/${
                VerifierContractAddresses[chainId] || walletAddress
              }`,
              {
                headers: {
                  Authorization: `Bearer ${ONE_INCH_KEY}`,
                },
                params: {
                  wallets: walletAddress,
                  filterEmpty: 'true',
                },
              }
            )
          );
          tokens.data.forEach((token) => {
            token.chainId = chainId;
          });
          return tokens.data.filter((token) => {
            if (type === 'STABLE_COINS')
              return isValidToken(token.address, chainId);
            else if (type == 'TRADING_COINS') {
              const tradingTokenAddresses = new Set(
                Object.values(TRADE_TOKENS_BY_CHAIN[chainId])
              );
              return tradingTokenAddresses.has(token.address);
            }
          });
        })
      );
      balance = balance.flat();
      res.send(balance);
    } catch (err) {
      console.error('[balance]', err);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
);
router.get('/chart/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  try {
    const redisKey = `chart_data:${token}`;
    let cachedToken = await r.get(redisKey);
    if (cachedToken) {
      return res.send(JSON.parse(cachedToken));
    }
    let tokens = await execute1InchApi((ONE_INCH_KEY) =>
      axios.get(
        `https://api.1inch.dev/charts/v1.0/chart/aggregated/candle/${getTokenAddress(
          token as any,
          1
        )}/${MAINNET_USDC}/300/1`,
        {
          headers: {
            Authorization: `Bearer ${ONE_INCH_KEY}`,
          },
          params: {
            indexes: null,
          },
        }
      )
    );
    await r.set(redisKey, JSON.stringify(tokens.data));
    await r.expire(redisKey, 1 * 60);
    res.send(tokens.data);
  } catch (error) {
    console.log(error);
    res.status(500).send('something went wrong');
  }
});
router.use('/insight', insightRouter);
export default router;
