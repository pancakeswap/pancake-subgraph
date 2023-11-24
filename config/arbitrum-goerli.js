const WETH = "0xee01c0cd76354c383b8c7b4e65ea88d00b06f36f";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "arbitrum-goerli",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x18a05774773b0886c19e3c3f6ed918869eb2aea2",
    stableIsToken0: true,
    factoryAddress: "0xba40c83026213f9cbc79998752721a0312bdb74a",
    startBlock: 22705895,
    stableCoins: [
      "0x179522635726710dd7d2035a81d856de4aa7836c", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x179522635726710dd7d2035a81d856de4aa7836c", // USDC
      "0xbe737d08fb505ad45e08a89ac7fda9791f025bf2", // ARB
    ],
    nonfungiblePositionManagerAddress: "0xb10120961f7504766976a89e29802fa00553da5b",
    nonfungiblePositionManagerStartBlock: 22708195,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x333eae459075b1d7de8eb57997b5d4eee5f1070a",
    startBlock: 22109729,
    wNativeStablePair0: "0x9eeb88ca54224373e8de64c1beeeaa2494f989ec", // WETH-USDC
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0x179522635726710dd7d2035a81d856de4aa7836c", // USDC
      "0xbe737d08fb505ad45e08a89ac7fda9791f025bf2", // ARB
    ],
    minETHLocked: 5,
  },
  predictionV2: {
    startBlock: 52492780,
    address: "0xd5330586c035a67bd32A6FD8e390c72DB9372861",
  },
};
