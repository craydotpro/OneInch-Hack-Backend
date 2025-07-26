import { Request, Response, Router } from 'express';
import { ChainId } from '../config/chains';
import { getTokenAddress } from '../config/tradeTokens';
import { OrderStatus, ReadableStatus } from '../interfaces/enum';
import { ISubmitOrderParams } from '../interfaces/orderParams';
import { Order } from '../models/order';
import { Position } from '../models/postition';
import { createOrder, processOrder } from '../services/orderService';
import { approveAllowance } from './helpers/permitERC20';
import execute1InchApi from '../../utils/limiter';
import axios from 'axios';
import { ENABLED_CHAIND_IDS } from '../../constant';
import { VerifierContractAddresses } from '../config/contractAddresses';
import { isValidToken } from '../config/tokens';


const router = Router({ mergeParams: true })

router.get('/health', async (_, res) => {
  res.send('ok')
})

// POST /api/position/prepare
router.post('/prepare-buy', async (req: Request, res: Response) => {
  try {
    // buy / (sell- relayer)
    const {
      userAddress,
      toToken,
      type,
      amountInUSD,
      triggerPrice,
      advanceSLTP
    } = req.body

    // get user balance
    // get gasprice
    // get token price

    // const route = await prepareSmartBuyRoute(userAddress, toToken, amountInUSD) //return destination details
    // // create and store orderHash
    const buyingChain = ChainId.BASE_CHAIN_ID
    const toTokenAddress = getTokenAddress(toToken, buyingChain)
    // save positionParams to database
    // prepare order to sign
    const payParams = {
      senderAddress: userAddress,
      receiverAddress: userAddress,
      amount: amountInUSD, // amount in USD
      destinationChain: ChainId.BASE_CHAIN_ID, // comes from route
      destinationToken: toTokenAddress, // comes from route
      orderType: 'dapp', // dapp
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
      deadline: Math.floor(Date.now() / 1000) + 300
    }
    // Create Order
    const { data, message } = await createOrder(payParams) // if destination token is not stable, prep 1inch swap data
    if (message) {
      return res.status(500).json({ error: message })
    }
    const position = await Position.create({ positionParams, orderHash: data.orderHash })
    // return order data to sign
    res.json({
      data: { ...data, positionId: position._id },
      message: 'Position prepared successfully',
    })
  } catch (err) {
    console.error('[preparePosition]', err)
    res.status(500).json({ error: 'Failed to prepare position' })
  }
})

// POST /api/position/submit
router.post('/submit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const submitOrderParams: ISubmitOrderParams = req.body.params
    const { signedOrder, signedApprovalData } = submitOrderParams
    const position = await Position.findById(id)
    if (!position) {
      return res.status(404).json({ error: 'Position not found' })
    }
    if (signedApprovalData) {
      await approveAllowance(signedApprovalData)
    }
    const updateSignedOrder = await Order.findOneAndUpdate({
      orderHash: position.orderHash,
      status: OrderStatus.INITIALIZED,
    }, {
      $set: {
        signedOrder,
        readableStatus: ReadableStatus.PROCESSING,
        status: OrderStatus.SIGNED,
        signedAt: new Date(),
      }
    }, {
      new: true,
    })
    if (!updateSignedOrder) {
      return res.status(404).json({ error: 'Order not found or already processed' })
    }
    
    processOrder({
      orderHash: position.orderHash,
      order: JSON.parse(updateSignedOrder.orderData),
      userSignature: updateSignedOrder.signedOrder
    })
    res.json({
      message: 'Position submitted successfully',
    })
  } catch (err) {
    console.error('[submitPosition]', err)
    res.status(500).json({ error: 'Failed to submit position' })
  }
})

router.get('/balance/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    let balance = await Promise.all(
      ENABLED_CHAIND_IDS.map(async (chainId) => {
        let tokens = await execute1InchApi((ONE_INCH_KEY) =>
          axios.get(
            `https://api.1inch.dev/balance/v1.2/${chainId}/aggregatedBalancesAndAllowances/${VerifierContractAddresses[chainId] || walletAddress}`,
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
