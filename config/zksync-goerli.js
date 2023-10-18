const WETH = "0x02968db286f24cb18bb5b24903ec8ebfacf591c0";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "zkSync2-testnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0xfc02e31553a979a5827ee95e17bae43ae79d6761",
    stableIsToken0: false,
    factoryAddress: "0x48e6bc3f2546e63908cd09b04e2b3f78e57b6292",
    startBlock: 9053839,
    stableCoins: [
      "0x0faf6df7054946141266420b43783387a78d82a9", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x0faf6df7054946141266420b43783387a78d82a9", // USDC
    ],
    nonfungiblePositionManagerAddress: "0xf84697cfe7c88f846e4ba5dae14a6a8f67def5c2",
    nonfungiblePositionManagerStartBlock: 9054587,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x48a33610cd0e130af2024d55f67ae72a8c51ac27",
    startBlock: 9053101,
    wNativeStablePair0: "0x0000000000000000000000000000000000000000",
    wNativeStablePair1: "0x6470f17db9b338df4955328077ce59b52fb5a961",
    whitelistAddresses: [
      WETH,
      "0x0faf6df7054946141266420b43783387a78d82a9", // USDC
    ],
    minETHLocked: 0,
  },
};
