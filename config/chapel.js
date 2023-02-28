/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "chapel",
  wNativeAddress: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  v3: {
    wNativeStablePoolAddress: "0xe8f08f0365b2875dbcf264a762b981ba3d612aec",
    factoryAddress: "0xb46d40a16e949270b44940b0482f1b0951a67046",
    startBlock: 27255654,
    stableCoins: ["0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e"],
    whitelistAddresses: ["0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e", "0xc1ed9955c11585f47d0d6bfbc29034349a746a81"],
    nonfungiblePositionManagerAddress: "0x8f78becb5decc1c083bfc3b182ec09c844a68532",
    nonfungiblePositionManagerStartBlock: 27309054,
  },
  masterChefV3: {
    masterChefAddress: "0x65aC33E4056B3D76DEB619b56F8e6F26D4c0CF4d",
    startBlock: 27309529,
  },
};
