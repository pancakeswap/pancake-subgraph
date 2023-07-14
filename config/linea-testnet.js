const WETH = "0x2c1b868d6596a18e32e61b901e4060c872647b6c";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "linea-testnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x0b3470b916cf46172940147b81941fd7b4ea2935",
    stableIsToken0: true,
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 710947,
    stableCoins: [
      "0xf56dc6695cf1f5c364edebc7dc7077ac9b586068", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0xf56dc6695cf1f5c364edebc7dc7077ac9b586068", // USDC
    ],
    nonfungiblePositionManagerAddress: "0xacfa791c833120c769fd3066c940b7d30cd8bc73",
    nonfungiblePositionManagerStartBlock: 711068,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0xb6fafd4adbcd21cf665909767e0ed0d05709abfb",
    startBlock: 703863,
    wNativeStablePair0: "0x947435ac2c2b4f6d025acaffac2db410bf874aed",
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0xf56dc6695cf1f5c364edebc7dc7077ac9b586068", // USDC
    ],
    minETHLocked: 0,
  },
};
