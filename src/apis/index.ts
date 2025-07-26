import { Request, Response, Router } from 'express';
import { ChainId } from '../config/chains';
import { getTokenAddress } from '../config/tradeTokens';
import { Position } from '../models/postition';
import { createOrder } from '../services/orderService';


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
    const order = await createOrder(payParams) // if destination token is not stable, prep 1inch swap data
    const position = await Position.create(positionParams)
    // return order data to sign
    res.json({
      data: order,
      'message': 'Position prepared successfully',
    })
  } catch (err) {
    console.error('[preparePosition]', err)
    res.status(500).json({ error: 'Failed to prepare position' })
  }
})

// POST /api/position/submit
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { signedPayload, signature} = req.body


    res.json({      message: 'Position submitted successfully',
    })
  } catch (err) {
    console.error('[submitPosition]', err)
    res.status(500).json({ error: 'Failed to submit position' })
  }
})


export default router
