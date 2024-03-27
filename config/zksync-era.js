const WETH = "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "zksync-era",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDC 500
    wNativeStablePoolAddress: "0x291d9f9764c72c9ba6ff47b451a9f7885ebf9977",
    stableIsToken0: true,
    factoryAddress: "0x1bb72e0cbbea93c08f535fc7856e0338d7f7a8ab",
    startBlock: 8639214,
    stableCoins: [
      "0x493257fd37edb34451f62edf8d2a0c418852ba4c", // USDT
      "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4", // USDC
      "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181", // BUSD
      "0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656", // DAI
      "0x8e86e46278518efc1c5ced245cba2c7e3ef11557", // USD+
    ],
    whitelistAddresses: [
      WETH,
      "0x493257fd37edb34451f62edf8d2a0c418852ba4c", // USDT
      "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181", // BUSD
      "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4", // USDC
      "0xbbeb516fb02a01611cbbe0453fe3c580d7281011", // WBTC
      "0x32fd44bb869620c0ef993754c8a00be67c464806", // rETH
      "0x703b52f2b28febcb60e1372858af5b18849fe867", // wstETH
      "0x3a287a06c66f9e95a56327185ca2bdf5f031cecd", // CAKE
      "0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656", // DAI
      "0x8e86e46278518efc1c5ced245cba2c7e3ef11557", // USD+
    ],
    nonfungiblePositionManagerAddress: "0xa815e2ed7f7d5b0c49fda367f249232a1b9d2883",
    nonfungiblePositionManagerStartBlock: 8640657,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0xd03d8d566183f0086d8d09a84e1e30b58dd5619d",
    startBlock: 8637655,
    wNativeStablePair0: "0x63edb9338d81c6d8219856548251bacf2a9b1830",
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0x493257fd37edb34451f62edf8d2a0c418852ba4c", // USDT
      "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181", // BUSD
      "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4", // USDC
      "0xbbeb516fb02a01611cbbe0453fe3c580d7281011", // WBTC
    ],
    minETHLocked: 1,
  },
  masterChefV3: {
    masterChefAddress: "0x4c615e78c5fca1ad31e4d66eb0d8688d84307463",
    startBlock: 8792225,
  },
  predictionV2: {
    startBlock: 22038753,
    address: "0x43c7771DEB958A2e3198ED98772056ba70DaA84c",
  },
};
