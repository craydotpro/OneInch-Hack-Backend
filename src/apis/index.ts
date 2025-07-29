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
import { Position } from '../models/postition';
import { createOrder, processOrder } from '../services/orderService';
import { approveAllowance } from './helpers/permitERC20';
import { prepareSLTPPosition } from './helpers/sltp';
import { prepareLimitOrder } from './helpers/swap';


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
      toToken, // ETH
      type, //market/limit
      amountInUSD,
      triggerPrice, // if limit order
      advanceSLTP
    } = req.body

    // get user balance
    // get gasprice
    // get token price

    // const route = await prepareSmartBuyRoute(userAddress, toToken, amountInUSD) //return destination details
    // // create and store orderHash
    let limitOrderData
    const buyingChain = ChainId.BASE_CHAIN_ID
    const toTokenAddress = getTokenAddress(toToken, buyingChain)
    const payParams = {
      senderAddress: userAddress,
      receiverAddress: userAddress,
      amount: amountInUSD, // amount in USD
      destinationChain: buyingChain, // comes from route
      destinationToken: toTokenAddress, // comes from route
      orderType: 'dapp', // dapp
    }
    if (type === 'limit') {
      // payParams with receiver address with USDC on buyingChain
      payParams.destinationToken = tokenSymbolMap[`${buyingChain}-USDC`].tokenAddress
      // Calculate the number of tokens to buy for the given USD amount and trigger price.
      // Example: amountInUSD = 100, triggerPrice = 1.2 => tokens = 100 / 1.2 = 83.333...
      // For tokens with 18 decimals:

      const typedData = await prepareLimitOrder({
        chainId: buyingChain,
        maker: userAddress,
        makerAsset: tokenSymbolMap[`${buyingChain}-USDC`].tokenAddress,
        takerAsset: toTokenAddress,
        makingAmount: parseUnits(amountInUSD.toString(), 6), // assuming USDC has 6 decimals
        takingAmount: parseUnits((amountInUSD / triggerPrice).toString(), 18)
      })
      console.log('Prepared Limit Order:', typedData)
      limitOrderData = {
        domain: typedData.domain,
        types: { Order: typedData.types.Order },
        message: typedData.message,
      }
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
      positionData: JSON.stringify(limitOrderData)
    }
    const position = await Position.create(positionParams)
    // return order data to sign
    res.json({
      result: { ...data, limitOrderData, positionId: position._id },
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
    const submitOrderParams: ISubmitOrderParams = req.body
    const { signedOrder, signedApprovalData } = submitOrderParams
    const position = await Position.findById(id)
    if (!position) {
      return res.status(404).json({ error: 'Position not found' })
    }
    if (signedApprovalData) {
      await approveAllowance(signedApprovalData)
    }
    const sii = [{
      chainId: ChainId.BASE_CHAIN_ID,
      data: signedOrder
    }]

    const updateSignedOrder = await Order.findOneAndUpdate({
      orderHash: position.orderHash,
      status: OrderStatus.INITIALIZED,
    }, {
      $set: {
        signedOrder: sii,
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

// POST set advance SLTP
router.post('/sltp/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { type, triggerPrice } = req.body
  
    const position = await Position.findById(id)
    if (!position) {
      return res.status(404).json({ error: 'Position not found' })
    }
    
    // Check if advanceSLTP already exists
    // prepare data to sign
    const preparePosition = {
      maker: position.userAddress,
      makerAsset: getTokenAddress(position.toToken, ChainId.BASE_CHAIN_ID),
      makerAmount: position.amountInUSD,
      takerAsset:  tokenSymbolMap[`${ChainId.BASE_CHAIN_ID}-USDC`].tokenAddress,
      triggerPrice,
      deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      isStopLoss: type === 'sl',
    }
    // const signature = await signSLTPPosition(getSolverAccountByChainId(ChainId.BASE_CHAIN_ID), preparePosition)
    const advanceSLTP = prepareSLTPPosition(preparePosition)
    await AdvanceSLTP.create({
      positionId: position._id,
      type,
      positionData: JSON.stringify(advanceSLTP),
    })

    res.json({
      message: 'Please sign the SL/TP position',
      result: { positionId: position._id, data: advanceSLTP },
    })
  } catch (err) {
    console.error('submitPosition', err)
    res.status(500).json({ error: 'Failed to submit position' })
  }
})

router.post('/sltp/submit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { signedPosition } = req.body
    const advanceSLTP = await AdvanceSLTP.findById(id)
    if (!advanceSLTP) {
      return res.status(404).json({ error: 'Advance SL/TP not found' });
    }
    if (!signedPosition) {
      return res.status(400).json({ error: 'Signed position data is required' });
    }
    // Update the advance SL/TP with the signed position
    advanceSLTP.signedPosition = signedPosition;
    advanceSLTP.status = 'active'; // Set status to active
    await advanceSLTP.save();
    res.json({
      message: 'SL/TP set successfully',
    })
  } catch (err) {
    console.error('submitSLTPPosition', err);
    return res.status(500).json({ error: 'Failed to submit SL/TP position' });
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
