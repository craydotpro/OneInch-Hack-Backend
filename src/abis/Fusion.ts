const fusionAbi = [
  {
    "inputs": [
      {
        "internalType": "contract CrayOrderVerifier",
        "name": "_orderVerifier",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_craySigner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_executer",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidContractSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSigner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MinAmountNotMet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnAuthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      }
    ],
    "name": "ActionExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      }
    ],
    "name": "ActionFailed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "AdvancePositionExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "orderInfo",
        "type": "bytes"
      }
    ],
    "name": "OrderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      }
    ],
    "name": "OrderFullFilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      }
    ],
    "name": "OrderSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "name": "connectors",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "craySigner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "chainId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Input[]",
                "name": "inputs",
                "type": "tuple[]"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "chainId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "minAmountOut",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                  }
                ],
                "internalType": "struct Output",
                "name": "output",
                "type": "tuple"
              },
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
              },
              {
                "internalType": "uint32",
                "name": "initiateDeadline",
                "type": "uint32"
              },
              {
                "internalType": "uint32",
                "name": "fillDeadline",
                "type": "uint32"
              },
              {
                "internalType": "uint256",
                "name": "settlementExpiry",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "metadata",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "internalType": "bytes",
                    "name": "payload",
                    "type": "bytes"
                  },
                  {
                    "internalType": "uint256",
                    "name": "gasLimit",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct DestinationAction",
                "name": "action",
                "type": "tuple"
              }
            ],
            "internalType": "struct CrayOrder",
            "name": "order",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "solverOutputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "index",
            "type": "uint8"
          },
          {
            "internalType": "bytes",
            "name": "userSignature",
            "type": "bytes"
          }
        ],
        "internalType": "struct InitiateArgs",
        "name": "args_",
        "type": "tuple"
      }
    ],
    "name": "createOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "maker",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "makerAsset",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "makerAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "takerAsset",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "triggerPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isStopLoss",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "swapContract",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "swapData",
            "type": "bytes"
          }
        ],
        "internalType": "struct AdvancePosition",
        "name": "advancePosition",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "userSignature",
        "type": "bytes"
      }
    ],
    "name": "executeAdvancePositions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "executedAdvancePositions",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executer",
    "outputs": [
      {
        "internalType": "contract Executer",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "chainId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Input[]",
                "name": "inputs",
                "type": "tuple[]"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "chainId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "minAmountOut",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                  }
                ],
                "internalType": "struct Output",
                "name": "output",
                "type": "tuple"
              },
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
              },
              {
                "internalType": "uint32",
                "name": "initiateDeadline",
                "type": "uint32"
              },
              {
                "internalType": "uint32",
                "name": "fillDeadline",
                "type": "uint32"
              },
              {
                "internalType": "uint256",
                "name": "settlementExpiry",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "metadata",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "internalType": "bytes",
                    "name": "payload",
                    "type": "bytes"
                  },
                  {
                    "internalType": "uint256",
                    "name": "gasLimit",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct DestinationAction",
                "name": "action",
                "type": "tuple"
              }
            ],
            "internalType": "struct CrayOrder",
            "name": "order",
            "type": "tuple"
          },
          {
            "internalType": "address",
            "name": "fullfiller",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct FullFillCrayOrderInput",
        "name": "input_",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "craySignature",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "makerAsset",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "swapContract",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "swapData",
            "type": "bytes"
          }
        ],
        "internalType": "struct SwapParams",
        "name": "swapParams",
        "type": "tuple"
      }
    ],
    "name": "fullFillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "chainId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Input[]",
                "name": "inputs",
                "type": "tuple[]"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "chainId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "minAmountOut",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                  }
                ],
                "internalType": "struct Output",
                "name": "output",
                "type": "tuple"
              },
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
              },
              {
                "internalType": "uint32",
                "name": "initiateDeadline",
                "type": "uint32"
              },
              {
                "internalType": "uint32",
                "name": "fillDeadline",
                "type": "uint32"
              },
              {
                "internalType": "uint256",
                "name": "settlementExpiry",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "metadata",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "internalType": "bytes",
                    "name": "payload",
                    "type": "bytes"
                  },
                  {
                    "internalType": "uint256",
                    "name": "gasLimit",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct DestinationAction",
                "name": "action",
                "type": "tuple"
              }
            ],
            "internalType": "struct CrayOrder",
            "name": "order",
            "type": "tuple"
          },
          {
            "internalType": "address",
            "name": "fullfiller",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct FullFillCrayOrderInput",
        "name": "input_",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "craySignature",
        "type": "bytes"
      }
    ],
    "name": "fullFillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "fullfilledOrders",
    "outputs": [
      {
        "internalType": "address",
        "name": "fullFiller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "fullFillmentTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "orderHash",
        "type": "bytes32"
      }
    ],
    "name": "getFullFilledOrderChainIds",
    "outputs": [
      {
        "internalType": "uint32[]",
        "name": "",
        "type": "uint32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "orderHash",
        "type": "bytes32"
      }
    ],
    "name": "getOrderStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "orders",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isCompleted",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "settler",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "settledAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "index",
        "type": "uint8"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "chainId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Input",
        "name": "input",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "siblingChainSlug_",
        "type": "uint32"
      },
      {
        "internalType": "bytes",
        "name": "payload_",
        "type": "bytes"
      }
    ],
    "name": "receiveInbound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "rescueTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "chainId",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "connectorAddress",
        "type": "address"
      }
    ],
    "name": "setConnector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "executer_",
        "type": "address"
      }
    ],
    "name": "setExecuter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "gasLimits",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "settleOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "crayId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "fulfiller",
        "type": "address"
      }
    ],
    "name": "submitProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifier",
    "outputs": [
      {
        "internalType": "contract CrayOrderVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]
export default fusionAbi
