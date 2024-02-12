const WETH = "0x4200000000000000000000000000000000000006";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "opbnb-testnet",
  wNativeAddress: WETH,
  v3: {
    // WBNB-USDT 500
    wNativeStablePoolAddress: "0xd246a3dc40d9b78de6676debdf2c5c42e4851888",
    stableIsToken0: false,
    factoryAddress: "0x0f81fd8dac20a21029b496d8f8e08385201b8ca0",
    startBlock: 4166871,
    stableCoins: [
      "0xcf712f20c85421d00eaa1b6f6545aaeeb4492b75", // USDT
    ],
    whitelistAddresses: [
      WETH,
      "0xcf712f20c85421d00eaa1b6f6545aaeeb4492b75", // USDT
    ],
    nonfungiblePositionManagerAddress: "0x9d4277f1d41ccb30c0e91f7d1bba2a739e19032c",
    nonfungiblePositionManagerStartBlock: 4237734,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x776e4bd2f72de2176a59465e316335aaf8ed4e8f",
    startBlock: 4162905,
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // WETH-USDC
    wNativeStablePair1: "0xbfdf00839a9ed3e424f1e8e841edcabdd0f8720e", // WETH-USDT
    whitelistAddresses: [
      WETH,
      "0xcf712f20c85421d00eaa1b6f6545aaeeb4492b75", // USDT
    ],
  },
};
