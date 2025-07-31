import { privateKeyToAccount } from "viem/accounts";


export const signPaymentData = async ({ user, crayOrder, allowanceData, limitOrderData, sltpOrderSign }) => {
  user = privateKeyToAccount(process.env.MAINNET_RELAYER_PRIVATE_KEY! as `0x${string}`);

  const sltpSignedOrder = sltpOrderSign && await user.signTypedData(sltpOrderSign)
  const signedOrder = crayOrder && await user.signTypedData(crayOrder)
  // }));
  const signedApprovalData =
    allowanceData?.length &&
    (await Promise.all(
      allowanceData.map(async (data) => {
        const signature = await user.signTypedData({
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
          walletAddress: user.account.address,
          value: data.values.value,
          deadline: data.values.deadline,
        }
      })
    ))
  const signedLimitOrder = limitOrderData && await user.signTypedData(limitOrderData)
  return { signedOrder, signedApprovalData, signedLimitOrder, sltpSignedOrder }
}