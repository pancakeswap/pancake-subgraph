/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "chapel",
  wNativeAddress: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  v3: {
    wNativeStablePoolAddress: "0x137957f79ca4d8c5eb11916da8e0f33e29470b48",
    factoryAddress: "0xd84787a01b0cad89fbca231e6960cc0f3f18df34",
    startBlock: 28284402,
    stableCoins: [
      "0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e",
      "0x0fb5d7c73fa349a90392f873a4fa1ecf6a3d0a96",
      "0xab1a4d4f1d656d2450692d237fdd6c7f9146e814",
    ],
    whitelistAddresses: [
      "0xae13d989dac2f0debff460ac112a837c89baa7cd",
      "0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e",
      "0xc1ed9955c11585f47d0d6bfbc29034349a746a81",
    ],
    nonfungiblePositionManagerAddress: "0xee02dc74894c7e973e058a676d513f25f4e1bec7",
    nonfungiblePositionManagerStartBlock: 28284500,
  },
  masterChefV3: {
    masterChefAddress: "0x2aadbf86ed7a9914bec5a01d50f44ca47ccf8c85",
    startBlock: 28284507,
  },
};
