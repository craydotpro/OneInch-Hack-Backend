import axios from 'axios';
import { Router } from 'express';
import { formatUnits } from 'viem';
import execute1InchApi from '../../utils/limiter';
import { ChainId } from '../config/chains';
import { getTokenSymbolFromAddress } from '../config/tradeTokens';
import { Position, PositionStatus } from '../models/postition';

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
            statuses: '1',
            sortBy: 'createDateTime',
          },
        }
      )
    );
    const result = orders?.data.map((order: any) => {
      const makerTokenSymbol = getTokenSymbolFromAddress(order.data.makerAsset);
      const takerTokenSymbol = getTokenSymbolFromAddress(order.data.takerAsset);
      const token= takerTokenSymbol || makerTokenSymbol
      const isBuy = takerTokenSymbol ? true: false;
      const youPay = isBuy ? `$${parseFloat(formatUnits(order.data.makingAmount, 6))}` : `${token} ${parseFloat(formatUnits(order.data.makingAmount, 18)).toFixed(7)}`;
      const youReceive = isBuy ? `${token} ${parseFloat(formatUnits(order.data.takingAmount, 18)).toFixed(7)}` : `$${parseFloat(formatUnits(order.data.takingAmount, 6))}`;
      const amount = formatUnits(order.makerBalance, 6);
      const remainingAmount = isBuy?formatUnits(order.remainingMakerAmount, 1):formatUnits(order.remainingMakerAmount, 6);
      const note = amount < remainingAmount && 'Insufficient balance';
      return {
        token,
        OrderType: isBuy? 'Buy' : 'Sell',
        youPay: youPay,
        youReceive: youReceive,
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
    const result = tradeHistory.map((trade) => {
      return {
        token: trade.toToken || trade.sellingToken,
        side: trade.orderType,
        // price: formatUnits(parseUnits(trade.takerRate, 18), 6),
        amount: `$${trade.amountInUSD}`,
        qty: parseFloat(trade.qty).toFixed(7),
        createdAt: trade.createdAt.toISOString(),
        status: trade.status,
        chainId: trade.executeOnChain,
      };
    });
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send('something went wrong');
  }
})
export default insightRouter;
