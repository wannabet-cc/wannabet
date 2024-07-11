export const BetAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "_betId", type: "uint256" },
      { internalType: "address", name: "_creator", type: "address" },
      { internalType: "address", name: "_participant", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "string", name: "_message", type: "string" },
      { internalType: "address", name: "_judge", type: "address" },
      { internalType: "uint256", name: "_validFor", type: "uint256" },
      { internalType: "address", name: "_factoryContract", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "BET__BadInput", type: "error" },
  { inputs: [], name: "BET__Expired", type: "error" },
  { inputs: [], name: "BET__FailedEthTransfer", type: "error" },
  { inputs: [], name: "BET__FailedTransfer", type: "error" },
  { inputs: [], name: "BET__FeeNotEnough", type: "error" },
  { inputs: [], name: "BET__FundsAlreadyWithdrawn", type: "error" },
  { inputs: [], name: "BET__InvalidStatus", type: "error" },
  { inputs: [], name: "BET__Unauthorized", type: "error" },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { anonymous: false, inputs: [], name: "BetAccepted", type: "event" },
  { anonymous: false, inputs: [], name: "BetDeclined", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "BetSettled",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "betDetails",
    outputs: [
      { internalType: "uint256", name: "betId", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "address", name: "participant", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "contract IERC20", name: "token", type: "address" },
      { internalType: "string", name: "message", type: "string" },
      { internalType: "address", name: "judge", type: "address" },
      { internalType: "uint256", name: "validUntil", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "declineBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getStatus",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "judgementReason",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "retrieveTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_winner", type: "address" },
      { internalType: "string", name: "_reason", type: "string" },
    ],
    name: "settleBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "winner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;