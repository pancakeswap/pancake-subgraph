export type NetworkConfig = {
  network: string;
  wNativeAddress: string;
  v3: {
    wNativeStablePoolAddress: string;
    factoryAddress: string;
    startBlock: number;
    stableCoins: string[];
    whitelistAddresses: string[];
    nonfungiblePositionManagerAddress: string;
    nonfungiblePositionManagerStartBlock: number;
  };
  masterChefV3: {
    startBlock: number;
    masterChefAddress: string;
  };
};
