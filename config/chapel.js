/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "chapel",
  wNativeAddress: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  v3: {
    wNativeStablePoolAddress: "0x3709035aeaf6258d432ec1c50d2ef1e0bf90a439",
    factoryAddress: "0x6c816814d8c03f6b4e55c7965d9814b151336775",
    startBlock: 27842013,
    stableCoins: ["0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e"],
    whitelistAddresses: ["0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e", "0xc1ed9955c11585f47d0d6bfbc29034349a746a81"],
    nonfungiblePositionManagerAddress: "0x7ac1781fbc0221eda1ba4d63f44f6851784de9dd",
    nonfungiblePositionManagerStartBlock: 27842064,
  },
  masterChefV3: {
    masterChefAddress: "0x1b453f8113426e750dcbf82799d32019f39fac5f",
    startBlock: 27842121,
  },
};
