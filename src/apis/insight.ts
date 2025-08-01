import axios from 'axios';
import { Router } from 'express';
import { formatUnits, parseUnits } from 'viem';
import execute1InchApi from '../../utils/limiter';
import { ChainId } from '../config/chains';
import { getTokenSymbolFromAddress } from '../config/tradeTokens';
import { Position, PositionStatus, PositionType } from '../models/postition';

const insightRouter = Router({ mergeParams: true });

insightRouter.get('/open-orders/:address', async (req, res) => {
  const { address } = req.params;
  try {
    // iterate for all suported chains, temp hardcoded to BASE_CHAIN_ID
    const chainId = ChainId.BASE_CHAIN_ID
    let orders = await execute1InchApi((ONE_INCH_KEY) =>
      axios.get(
        `https://api.1inch.dev/orderbook/v4.0/${chainId}/address/${address}`,
        {
          headers: {
            Authorization: `Bearer ${ONE_INCH_KEY}`,
          },
          params: {
            page: 1,
            limit: 100,
            statuses: '1,2',
            sortBy: 'createDateTime',
          },
        }
      )
    );
    const result = orders?.data.map((order: any) => {
      const takerTokenSymbol = getTokenSymbolFromAddress(order.data.takerAsset);
      const amount = formatUnits(order.makerBalance, 6);
      const remainingAmount = formatUnits(order.remainingMakerAmount, 6);
      const note = amount < remainingAmount && 'Insufficient balance';
      return {
        token: takerTokenSymbol,
        OrderType: PositionType.LIMIT,
        price: formatUnits(parseUnits(order.takerRate, 18), 6),
        amount: remainingAmount.toString(),
        note,
        createdAt: new Date(order.createDateTime).toISOString(),
        actions: ['Cancel'],
        orderHash: order.orderHash,
        chainId: chainId,
      }
    });
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send('something went wrong');
  }
});

insightRouter.get('/trade-history/:address', async (req, res) => { 
  const { address } = req.params;
  try {
    const tradeHistory = await Position.find({
      userAddress: address,
      status: { $in: [PositionStatus.EXECUTED, PositionStatus.FAILED, PositionStatus.CANCELLED] },
    }).sort({ createdAt: -1 });
    console.log(tradeHistory);
    res.send(tradeHistory);
  } catch (error) {
    console.log(error);
    res.status(500).send('something went wrong');
  }
})
export default insightRouter;
