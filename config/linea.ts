const WETH = "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "linea",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "",
    stableIsToken0: true,
    factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    startBlock: 0,
    stableCoins: [
      "", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "", // USDC
    ],
    nonfungiblePositionManagerAddress: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
    nonfungiblePositionManagerStartBlock: 0,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
    startBlock: 0,
    wNativeStablePair0: "",
    wNativeStablePair1: "",
    whitelistAddresses: [
      WETH,
      "", // USDC
    ],
    minETHLocked: 0,
  },
};
