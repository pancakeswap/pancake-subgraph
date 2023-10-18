const WETH = "0x4200000000000000000000000000000000000006";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "base-testnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDC 500
    wNativeStablePoolAddress: "0xb72a9c64a31d735049bd1977b4d5a800753c2e27",
    stableIsToken0: false,
    factoryAddress: "0x618f16159d489aa7761168f0200b7705dee9e2c0",
    startBlock: 8456536,
    stableCoins: [
      "0x853154e2A5604E5C74a2546E2871Ad44932eB92C", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x853154e2A5604E5C74a2546E2871Ad44932eB92C", // USDC
    ],
    nonfungiblePositionManagerAddress: "0x0f81fd8dac20a21029b496d8f8e08385201b8ca0",
    nonfungiblePositionManagerStartBlock: 8457197,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x715303d2ef7da7ffabf637651d71fd11d41faf7f",
    startBlock: 8455822,
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // WETH-USDC
    wNativeStablePair1: "0xc4bf315714c3144714b19c003b316081b11bcc94",
    whitelistAddresses: [
      WETH,
      "0x853154e2A5604E5C74a2546E2871Ad44932eB92C", // USDC
    ],
    minETHLocked: 5,
  },
};
