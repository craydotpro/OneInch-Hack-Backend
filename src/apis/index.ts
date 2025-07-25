import { Request, Response, Router } from 'express'
import { Position } from '../models/postition'
import { createOrder } from '../services/orderService'
import { prepareSmartBuyRoute } from '../services/routingService'

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

    const route = await prepareSmartBuyRoute(userAddress, toToken, amountInUSD) //return destination details
    // create and store orderHash
    const positionParams = {
      userAddress,
      toToken,
      type,
      amountInUSD,
      qty: route.estimatedQty,
      slippage: 0.5,
      triggerPrice,
      advanceSLTP,
      deadline: Math.floor(Date.now() / 1000) + 300
    }

    // save positionParams to database
    // prepare order to sign
    const payParams = {
      senderAddress: userAddress,
      receiverAddress: userAddress,
      amount: amountInUSD, // amount in USD
      destinationChain: route.destinationChain, // comes from route
      destinationToken: route.destinationToken, // comes from route
      orderType: 'p2p', // dapp
    }
    // Create Order
    const order = await createOrder(payParams) // if destination token is not stable, prep 1inch swap data
    const position = await Position.create(positionParams)
    // return order data to sign
    res.json({
      'message': 'Position prepared successfully',
    })
  } catch (err) {
    console.error('[preparePosition]', err)
    res.status(500).json({ error: 'Failed to prepare position' })
  }
})

// router.post('/sell', async (req: Request, res: Response) => {
//   try {
//     // buy / (sell- relayer)
//     const {
//       userAddress,
//       toToken,
//       type,
//       amountInUSD,
//       triggerPrice,
//       advanceSLTP
//     } = req.body

//     // get user balance
//     // get gasprice
//     // get token price

//     const route = await prepareSmartBuyRoute(userAddress, toToken, amountInUSD) //return destination details
//     // create and store orderHash
//     const positionParams = {
//       userAddress,
//       toToken,
//       type,
//       amountInUSD,
//       qty: route.estimatedQty,
//       slippage: 0.5,
//       triggerPrice,
//       advanceSLTP,
//       chain: route.fromChain,
//       deadline: Math.floor(Date.now() / 1000) + 300
//     }

//     // save positionParams to database
//     // prepare order to sign
//     const payParams = {
//       senderAddress: userAddress,
//       receiverAddress: userAddress,
//       amount: amountInUSD, // amount in USD
//       destinationChain, // comes from route
//       destinationToken, // comes from route
//       orderType: 'p2p', // dapp
//     }
//     // Create Order
//     const order = await createOrder(payParams)
//     // return order data to sign
//     res.json({
//       'message': 'Position prepared successfully',
//     })
//   } catch (err) {
//     console.error('[preparePosition]', err)
//     res.status(500).json({ error: 'Failed to prepare position' })
//   }
// })

// POST /api/position/submit
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { signedPayload, signature, swapData, routeInfo } = req.body

    const valid = verifySignature(signedPayload.wallet, signedPayload, signature)
    if (!valid) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const position = await Position.create({
      ...signedPayload,
      status: 'pending',
      signature,
      routeInfo,
      createdAt: new Date()
    })

    res.json({
      positionId: position._id,
      status: position.status
    })
  } catch (err) {
    console.error('[submitPosition]', err)
    res.status(500).json({ error: 'Failed to submit position' })
  }
})


export default router
