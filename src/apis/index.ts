import axios from 'axios';
import { Request, Response, Router } from 'express';
import { parseUnits } from 'viem';
import { ENABLED_CHAIND_IDS } from '../../constant';
import execute1InchApi from '../../utils/limiter';
import { ChainId } from '../config/chains';
import { VerifierContractAddresses } from '../config/contractAddresses';
import { isValidToken, tokenSymbolMap } from '../config/tokens';
import { getTokenAddress } from '../config/tradeTokens';
import { OrderStatus, ReadableStatus } from '../interfaces/enum';
import { ISubmitOrderParams } from '../interfaces/orderParams';
import { AdvanceSLTP } from '../models/advancePositions';
import { Order } from '../models/order';
import { Position, PositionStatus, PositionType } from '../models/postition';
import { createOrder, processOrder } from '../services/orderService';
import { approveAllowance } from './helpers/permitERC20';
import { prepareSLTPPosition } from './helpers/sltp';
import { prepareLimitOrder, submitLimitOrder } from './helpers/swap';

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
    const { data, message } = await createOrder(payParams) // if destination token is not stable, prep 1inch swap data
    if (message) {
      return res.status(500).json({ error: message })
    }
    const positionParams = {
      userAddress,
      toToken,
      type,
      amountInUSD,
      // qty: route.estimatedQty,
      slippage: 0.5,
      triggerPrice,
      advanceSLTP,
      deadline: Math.floor(Date.now() / 1000) + 300,
      orderHash: data.orderHash,
      limitOrderHash,
      limitOrderData: JSON.stringify(limitOrderData),
      limitOrderTypedData: JSON.stringify(limitOrderTypedData),
    };
    const position = await Position.create(positionParams);
    res.json({
      result: { ...data, limitOrderTypedData, positionId: position._id },
      message: 'Position prepared successfully',
    });
  } catch (err) {
    console.error('[preparePosition]', err);
    res.status(500).json({ error: 'Failed to prepare position' });
  }
});

// POST /api/position/submit
router.post('/submit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submitOrderParams: ISubmitOrderParams = req.body;
    const { signedOrder, signedApprovalData, signedLimitOrder } =
      submitOrderParams;
    const position = await Position.findById(id);
    let order;
    let positionStatus= PositionStatus.PENDING;
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    if (signedApprovalData) {
      await approveAllowance(signedApprovalData);
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
      order = await processOrder({
        orderHash: position.orderHash,
        order: JSON.parse(updateSignedOrder.orderData),
        userSignature: updateSignedOrder.signedOrder,
      });
      positionStatus = position.type === PositionType.MARKET && order?.readableStatus === ReadableStatus.COMPLETED ? PositionStatus.EXECUTED : PositionStatus.FAILED;
    }
    await Position.findByIdAndUpdate(
      id,
      {
        $set: {
          status: positionStatus,
        },
      },
    )
    if (order && order?.readableStatus !== ReadableStatus.COMPLETED) {
      return res.status(400).json({
        error: `something went wrong in submitting position, Please try again later`,
      });
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
      const orderInfo = await submitLimitOrder({
        chainId: ChainId.BASE_CHAIN_ID,
        orderHash: updatePosition.limitOrderHash,
        order: JSON.parse(updatePosition.limitOrderData),
        signedOrder: signedLimitOrder,
      });
      const posStatus = orderInfo ? PositionStatus.ACTIVE : PositionStatus.FAILED;
      await Position.findByIdAndUpdate(
        id,
        {
          $set: {
            status: posStatus,
          },
        },
      );
      if (!orderInfo) {
        return res.status(400).json({
          error: 'Failed to submit limit order',
        });
      }
     
      res.json({
        result: { ...orderInfo },
        message: 'Position submitted successfully',
      });
    }
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
      makerAsset: getTokenAddress(position.toToken, ChainId.BASE_CHAIN_ID),
      makerAmount: position.amountInUSD,
      takerAsset: tokenSymbolMap[`${ChainId.BASE_CHAIN_ID}-USDC`].tokenAddress,
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
    console.error('submitPosition', err);
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

export default router;
