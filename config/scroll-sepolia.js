const WETH = "0x5300000000000000000000000000000000000004";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "scroll-sepolia",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x4040ce732c1a538a4ac3157fdc35179d73ea76cd",
    stableIsToken0: true,
    factoryAddress: "0x5a6919dfd2c761788608b0d1bd1239961adcb08b",
    startBlock: 21481,
    stableCoins: [
      "0x02a3e7e0480b668bd46b42852c58363f93e3ba5c", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x02a3e7e0480b668bd46b42852c58363f93e3ba5c", // USDC
    ],
    nonfungiblePositionManagerAddress: "0x0f81fd8dac20a21029b496d8f8e08385201b8ca0",
    nonfungiblePositionManagerStartBlock: 21761,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x2b3c5df29f73dbf028ba82c33e0a5a6e5800f75e",
    startBlock: 21200,
    wNativeStablePair0: "0x894998d4312c1ff95ad0b195637c0e6d82dd0561", // WETH-USDC
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0x02a3e7e0480b668bd46b42852c58363f93e3ba5c", // USDC
    ],
  },
};
