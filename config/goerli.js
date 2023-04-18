/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "goerli",
  wNativeAddress: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
  v3: {
    wNativeStablePoolAddress: "0xa09ab806a64aa311f67f8ccb3563ce1cd2a5b1e5",
    stableIsToken0: false,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 8744706,
    stableCoins: ["0xb8da084d035c9c38518d86a9d079ba6a0aec4327", "0x07865c6e87b9f70255377e024ace6630c1eaa37f"],
    whitelistAddresses: [
      "0xb8da084d035c9c38518d86a9d079ba6a0aec4327",
      "0xd134b434682df091e398a844dc3c613fe728ce2d",
      "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    ],
    nonfungiblePositionManagerAddress: "0x427bf5b37357632377ecbec9de3626c71a5396c1",
    nonfungiblePositionManagerStartBlock: 8744479,
    minETHLocked: 30,
  },
  masterChefV3: {
    masterChefAddress: "0x864ed564875bddd6f421e226494a0e7c071c06f8",
    startBlock: 8744672,
  },
};
