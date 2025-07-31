import axios from "axios";
import dotenv from 'dotenv';
import { privateKeyToAccount } from "viem/accounts";
import { ChainId } from "./config/chains";
import { signPaymentData } from "./utils/signer";
dotenv.config()
// call api

const main = async () => {
  try {
    const body = {
      "userAddress": "0x87146d9C3230CF0FCe7ae16a7140522f313bAfCd",
      "toToken": "ETH",
      "type": "limit",
      "amountInUSD": "2",
      "triggerPrice": "3861.8",
    }
    
    const result = await axios.post("http://localhost:8000/api/prepare-buy", body)
    const { signedLimitOrder } = await signPaymentData({
      user: privateKeyToAccount(process.env.MAINNET_RELAYER_PRIVATE_KEY! as `0x${string}`),
      crayOrder: result.data.result.crayOrder,
      allowanceData: result.data.result.allowanceData,
      limitOrderData: result.data.result.limitOrderTypedData,
      sltpOrderSign: result.data.result.sltpOrderSign
    })
    const posId = result.data.result.positionId
    const body1 = {
      // signedOrder: signedOrder ? [{ chainId: ChainId.BASE_CHAIN_ID, data: signedOrder }]: [],
      signedLimitOrder: signedLimitOrder ? [{ chainId: ChainId.BASE_CHAIN_ID, data: signedLimitOrder }] : [],
    }
    const result2 = await axios.post(`http://localhost:8000/api/submit/${posId}`, body1)
    console.log('Order submitted:', result2.data);
  }catch (error) {
    console.error('Error in main function:', error);
  }
}


main().catch((error) => {
  console.error('Error in main function:', error);
});
