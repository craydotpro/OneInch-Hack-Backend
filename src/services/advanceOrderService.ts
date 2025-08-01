import { parseUnits } from "viem";
import { prepareSLTPPosition } from "../apis/helpers/sltp";
import { tokenSymbolMap } from "../config/tokens";
import { AdvanceSLTP } from "../models/advancePositions";
const { Types } = require('mongoose');

export async function processAdvanceOrder(position) {
  console.log('Processing advance order for position:', position);
  const entries = []
  const sltpPos = []
  for (const type of ['sl', 'tp'] as const) {
    const pos = position.advanceSLTP[type];
    const preparePosition = {
      maker: position.userAddress,
      makerAsset: position.toTokenAddress,
      makerAmount: parseUnits(position.qty, 18),
      takerAsset: tokenSymbolMap[`${position.executeOnChain}-USDC`].tokenAddress,
      triggerPrice: pos.price,
      deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      isStopLoss: type === 'sl',
    };
    // const signature = await signSLTPPosition(getSolverAccountByChainId(ChainId.BASE_CHAIN_ID), preparePosition)
    const advanceSLTP = prepareSLTPPosition(preparePosition);
    sltpPos.push({ [type]: advanceSLTP });
    entries.push({
      positionId: position._id,
      type,
      positionData: JSON.stringify(advanceSLTP),
    });
  }
  if (entries.length) {
    await AdvanceSLTP.insertMany(entries);
  }
  return sltpPos;
}

export async function storeSLTPPositions(posId, signedPosition) {
  const updatePromises = Array.from(signedPosition).flatMap((pos) =>    
    Object.entries(pos).map(([type, data]) => {
      return AdvanceSLTP.findOneAndUpdate(
        { positionId: Types.ObjectId(posId), type },
        { signedPosition: data, status: 'active' },
        { new: true }
      )
    })
  );
  const advanceSLTP = await Promise.all(updatePromises);
  if (!advanceSLTP) {
    return false;
  }
  return true;
}