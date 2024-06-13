export const betFactoryAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BetCreated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "_betId", type: "uint256" }],
    name: "betAddresses",
    outputs: [
      { internalType: "address", name: "contractAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "betCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_contractAddress", type: "address" },
    ],
    name: "betIds",
    outputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_participant", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "string", name: "_message", type: "string" },
      { internalType: "address", name: "_arbitrator", type: "address" },
      { internalType: "uint256", name: "_validFor", type: "uint256" },
    ],
    name: "createBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_userAddress", type: "address" },
    ],
    name: "userBetCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_userAddress", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "userBets",
    outputs: [
      { internalType: "uint256", name: "betId", type: "uint256" },
      { internalType: "address", name: "contractAddress", type: "address" },
      { internalType: "bool", name: "isCreator", type: "bool" },
      { internalType: "bool", name: "isParticipant", type: "bool" },
      { internalType: "bool", name: "isArbitrator", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
