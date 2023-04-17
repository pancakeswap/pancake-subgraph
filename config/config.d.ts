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
    stableIsToken0: boolean;
    minETHLocked: number;
  };
  v2: {
    wNativeStablePoolAddress: string;
    factoryAddress: string;
    startBlock: number;
    whitelistAddresses: string[];
    wNativeStablePair0: string;
    wNativeStablePair1: string;
  };
  masterChefV3: {
    startBlock: number;
    masterChefAddress: string;
  };
};
