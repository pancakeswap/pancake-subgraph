const WETH = "0x2ad78787ccaf7fa8fae8953fd78ab9163f81dcc8";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "polygon-zkevm-testnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0xb7e245b9dabf373194c912e72333b8355a0725bd", // TODO: new chain
    stableIsToken0: false,
    factoryAddress: "0x2430dbd123bc40f8be6110065a448c1aa0619cb1",
    startBlock: 774348,
    stableCoins: [
      "0x7379a261bc347bdd445484a91648abf4a2bdee5e", // USDT
    ],
    whitelistAddresses: [
      WETH,
      "0x7379a261bc347bdd445484a91648abf4a2bdee5e", // USDT
    ],
    nonfungiblePositionManagerAddress: "0x8ab65a2ebc44a38eace6cd14643337b03787b08f", // TODO: new chain
    nonfungiblePositionManagerStartBlock: 774445, // TODO: new chain
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "", // TODO: new chain
    startBlock: 0, // TODO: new chain
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // TODO: new chain
    wNativeStablePair1: "0x0000000000000000000000000000000000000000", // TODO: new chain
    whitelistAddresses: [
      WETH,
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
    ],
  },
};
