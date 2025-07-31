
export const signSLTPPosition = (account: any, position: any) => {
  const domain = {
    name: "AdvancePosition",
    version: "1",
  }
  const types = {
    AdvancePosition: [
      { name: "maker", type: "address" },
      { name: "makerAsset", type: "address" },
      { name: "makerAmount", type: "uint256" },
      { name: "takerAsset", type: "address" },
      { name: "triggerPrice", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "isStopLoss", type: "bool" },
    ],
  };
  return account.signTypedData({
    domain,
    types,
    primaryType: "AdvancePosition",
    message: position,
  });
}

export const prepareSLTPPosition = ( position: any) => {
  const domain = {
    name: "AdvancePosition",
    version: "1",
  }
  const types = {
    AdvancePosition: [
      { name: "maker", type: "address" },
      { name: "makerAsset", type: "address" },
      { name: "makerAmount", type: "uint256" },
      { name: "takerAsset", type: "address" },
      { name: "triggerPrice", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "isStopLoss", type: "bool" },
    ],
  };
  return{
    domain,
    types,
    primaryType: "AdvancePosition",
    message: position,
  }
}
