import axios from "axios";
import dotenv from 'dotenv';
import { privateKeyToAccount } from "viem/accounts";
import { ChainId } from "./config/chains";
dotenv.config()
// call api
const main = async () => {
  try {
    const body = {
      "userAddress": "0x87146d9C3230CF0FCe7ae16a7140522f313bAfCd",
      "toToken": "ETH",
      "type": "market",
      "amountInUSD": "15"
    }
    console.log('Request body:', body);
    const result = await axios.post("http://localhost:8000/api/prepare-buy", body)
    console.log('Signed Order:', result);
    const { signedOrder } = await signPaymentData(body.userAddress, result.data.result.typedOrder)
    console.log('position', result.data.result.positionId);
    const posId = result.data.result.positionId
    console.log('Signed Order:', signedOrder);
    const body1 = {
      signedOrder: [{chainId: ChainId.BASE_CHAIN_ID, data: signedOrder}],
    }
    const result2 = await axios.post(`http://localhost:8000/api/submit/${posId}`, body1)
    console.log('Order submitted:', result2.data);
  }catch (error) {
    console.error('Error in main function:', error);
  }
}

main();


export const signPaymentData = async (owner: any, crayOrder: any, allowanceData?: any[]) => {
  // todo: check if spender is SCA then sign separately for all chains
  // const orders = Array.isArray(orderHash) ? orderHash : [orderHash];
  // const signedOrder = await Promise.all(orders.map(async (hash) => {
  const user = privateKeyToAccount(process.env.MAINNET_RELAYER_PRIVATE_KEY! as `0x${string}`);

  const signedOrder = await user.signTypedData(crayOrder)
  // }));
  const signedApprovalData =
    allowanceData &&
    (await Promise.all(
      allowanceData.map(async (data) => {
        const signature = await owner.signTypedData({
          types: data.types,
          domain: data.domainData,
          message: data.values,
          primaryType: "Permit",
        })
        return {
          r: signature.slice(0, 66),
          s: "0x" + signature.slice(66, 130),
          v: "0x" + signature.slice(130, 132),
          chainId: data.domainData.chainId,
          verifyingContract: data.domainData.verifyingContract,
          walletAddress: owner.account.address,
          value: data.values.value,
          deadline: data.values.deadline,
        }
      })
    ))
  return { signedOrder, signedApprovalData }
}