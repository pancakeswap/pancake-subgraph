/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "chapel",
  wNativeAddress: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  v3: {
    wNativeStablePoolAddress: "0x5147173e452ae4dd23dcee7baaaaab7318f16f6b",
    stableIsToken0: true,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 28488223,
    stableCoins: [
      "0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e",
      "0x0fb5d7c73fa349a90392f873a4fa1ecf6a3d0a96",
      "0xab1a4d4f1d656d2450692d237fdd6c7f9146e814",
    ],
    whitelistAddresses: [
      "0xae13d989dac2f0debff460ac112a837c89baa7cd",
      "0x828e3fc56dd48e072e3b6f3c4fd4ddb4733c2c5e",
      "0xc1ed9955c11585f47d0d6bfbc29034349a746a81",
      "0x0fb5d7c73fa349a90392f873a4fa1ecf6a3d0a96",
      "0xab1a4d4f1d656d2450692d237fdd6c7f9146e814",
    ],
    nonfungiblePositionManagerAddress: "0x427bf5b37357632377ecbec9de3626c71a5396c1",
    nonfungiblePositionManagerStartBlock: 28488308,
    minETHLocked: 60,
  },
  masterChefV3: {
    masterChefAddress: "0x4c650fb471fe4e0f476fd3437c3411b1122c4e3b",
    startBlock: 28492774,
  },
};
