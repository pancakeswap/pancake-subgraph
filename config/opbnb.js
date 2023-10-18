const WETH = "0x4200000000000000000000000000000000000006";
const USDT = "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "opbnb-mainnet",
  wNativeAddress: WETH,
  v3: {
    // WBNB-USDT 500
    wNativeStablePoolAddress: "0xc4f981189558682f15f60513158b699354b30204",
    stableIsToken0: false,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 1721753,
    stableCoins: [USDT],
    whitelistAddresses: [WETH, USDT],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
    nonfungiblePositionManagerStartBlock: 1730685,
    minETHLocked: 1,
  },
  v2: {
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 1708914,
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // WETH-USDC
    wNativeStablePair1: "0x706f7257e78b6f2404a1afb5c480645a6f5be91d", // WETH-USDT
    whitelistAddresses: [WETH, USDT],
    minETHLocked: 0,
  },
};
