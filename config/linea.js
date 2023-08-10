const WETH = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "linea",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDC 500
    wNativeStablePoolAddress: "0xd5539d0360438a66661148c633a9f0965e482845",
    stableIsToken0: true,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 1444,
    stableCoins: [
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
      "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5", // DAI
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // BUSD
    ],
    whitelistAddresses: [
      WETH,
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4", // WBTC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
      "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5", // DAI
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // BUSD
    ],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
    nonfungiblePositionManagerStartBlock: 1459,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 1439,
    wNativeStablePair0: "0xb91a09d3794e815008194b0423802af8359516db",
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4", // WBTC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
      "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5", // DAI
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // BUSD
    ],
    minETHLocked: 0,
  },
};
