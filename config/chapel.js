/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "chapel",
  wNativeAddress: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  v3: {
    wNativeStablePoolAddress: "0xe0b701d9a80d582539f6fa2d29ceef86f79c8109",
    factoryAddress: "0xbf12bb25090505045be1884538cbdfffa348d714",
    startBlock: 28004940,
    stableCoins: ["0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e"],
    whitelistAddresses: ["0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e", "0xc1ed9955c11585f47d0d6bfbc29034349a746a81"],
    nonfungiblePositionManagerAddress: "0x8a45515e2f31ad06ba3196155092a60fac6c2110",
    nonfungiblePositionManagerStartBlock: 28005251,
  },
  masterChefV3: {
    masterChefAddress: "0x1b4379897415a74213285f1bfe9b7b069225fe29",
    startBlock: 28005534,
  },
};
