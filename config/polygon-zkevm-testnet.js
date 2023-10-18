const WETH = "0x30ec47f7dfae72ea79646e6cf64a8a7db538915b";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "polygon-zkevm-testnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x885cd30213b89cb53e812eb2dd56c61a8178a256",
    stableIsToken0: false,
    factoryAddress: "0x2430dbd123bc40f8be6110065a448c1aa0619cb1",
    startBlock: 776055,
    stableCoins: [
      "0x7379a261bC347BDD445484A91648Abf4A2BDEe5E", // USDT
    ],
    whitelistAddresses: [
      WETH,
      "0x7379a261bC347BDD445484A91648Abf4A2BDEe5E", // USDT
    ],
    nonfungiblePositionManagerAddress: "0x1f489dd5b559e976ae74303f939cfd0af1b62c2b",
    nonfungiblePositionManagerStartBlock: 774445,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0xba40c83026213f9cbc79998752721a0312bdb74a",
    startBlock: 773605,
    wNativeStablePair0: "0x30ac79ce17f99cec768fbc6d5d4596f6582fe284",
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0x7379a261bC347BDD445484A91648Abf4A2BDEe5E", // USDT
    ],
    minETHLocked: 0,
  },
  masterChefV3: {
    masterChefAddress: "0xb66b07590b30d4e6e22e45ddc83b06bb018a7b44",
    startBlock: 1097428,
  },
};
