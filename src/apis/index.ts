import { Request, Response, Router } from 'express'

const router = Router({ mergeParams: true })

router.get('/health', async (_, res) => {
  res.send('ok')
})

// POST /api/position/prepare
router.post('/prepare', async (req: Request, res: Response) => {
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

     //prepare route return destination details
    // create and store orderHash
    // prepare order to sign
    
    // Create Order
    // if destination token is not stable, prep 1inch swapData
    // save positionParams to database
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
    // store signed positionParams
    // execute position
  } catch (err) {
    console.error('[submitPosition]', err)
    res.status(500).json({ error: 'Failed to submit position' })
  }
})


export default router
