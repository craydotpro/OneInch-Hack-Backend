import axios from 'axios';
import { Router } from 'express';
import execute1InchApi from '../../utils/limiter';

const insightRouter = Router({ mergeParams: true });
insightRouter.get('/open-orders/:chainId/:address', async (req, res) => {
  const { address, chainId } = req.params;
  try {
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
    res.send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send('something went wrong');
  }
});
export default insightRouter;
