# PancakeSwap Subgraph

TheGraph exposes a GraphQL endpoint to query the events and entities within the Binance Smart Chain and PancakeSwap ecosystem.

Currently, there are multiple subgraphs, but additional subgraphs can be added to this repository, following the current architecture.

## Subgraphs

1. **[Blocks](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/blocks)**: Tracks all blocks on Binance Smart Chain.

   - BSC https://thegraph.com/legacy-explorer/subgraph/pancakeswap/blocks
   - zkSync https://api.studio.thegraph.com/query/45376/blocks-zksync/version/latest
   - zkSync testnet https://api.studio.thegraph.com/query/45376/blocks-zksync-testnet/version/latest
   - Polygon zkEVM https://api.studio.thegraph.com/query/45376/polygon-zkevm-block/version/latest
   - opBNB https://opbnb-mainnet-graph.nodereal.io/subgraphs/name/pancakeswap/blocks

2. **[Exchange V2](https://nodereal.io/meganode/api-marketplace/pancakeswap-graphql)**: Tracks all PancakeSwap V2 Exchange data with price, volume, liquidity, ...

   - BSC https://nodereal.io/meganode/api-marketplace/pancakeswap-graphql
   - ETH https://api.thegraph.com/subgraphs/name/pancakeswap/exhange-eth
   - ARB
     - Hosted https://thegraph.com/hosted-service/subgraph/pancakeswap/exchange-v2-arb
     - Studio https://api.studio.thegraph.com/query/45376/exchange-v2-arbitrum/version/latest
   - ARB GRO https://api.thegraph.com/subgraphs/name/chef-jojo/exchange-v2-arb-goerli
   - Polygon zkEVM https://api.studio.thegraph.com/query/45376/exchange-v2-polygon-zkevm/version/latest
   - Polygon zkEVM testnet https://api.studio.thegraph.com/query/45376/exchange-v2-polygon-zkevm-test/version/latest
   - zkSync https://api.studio.thegraph.com/query/45376/exchange-v2-zksync/version/latest
   - zkSync testnet https://api.studio.thegraph.com/query/45376/exchange-v2-zksync-testnet/version/latest
   - Linea https://graph-query.linea.build/subgraphs/name/pancakeswap/exhange-v2
   - Base https://api.studio.thegraph.com/query/45376/exchange-v2-base/version/latest
   - Base testnet https://api.studio.thegraph.com/query/45376/exchange-v2-base-testnet/version/latest
   - Scroll https://api.studio.thegraph.com/query/45376/exchange-v2-scroll/version/latest
   - Scroll Sepolia https://api.studio.thegraph.com/query/45376/exchange-v2-scroll-sepolia/version/latest
   - opBNB https://opbnb-mainnet-graph.nodereal.io/subgraphs/name/pancakeswap/exchange-v2

3. **[Farm Auctions](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/farm-auctions)**: Tracks all PancakeSwap Farm Auctions with auctions and bids.

4. **[Lottery](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/lottery)**: Tracks all PancakeSwap Lottery with rounds, draws and tickets.

5. **[NFT Market (v1)](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/nft-market)**: Tracks all PancakeSwap NFT Market for ERC-721.

6. **[Pairs](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/pairs)**: Tracks all PancakeSwap Pairs and Tokens.

7. **[Pancake Squad](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/pancake-squad)**: Tracks all Pancake Squad metrics with Owners, Tokens (including metadata), and Transactions.

8. **[Prediction (v1)](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/prediction)**: Tracks all PancakeSwap Prediction (v1) with market, rounds, and bets.

9. **[Prediction (v2)](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/prediction-v2)**: Tracks all PancakeSwap Prediction (v2) with market, rounds, and bets.

10. **[Profile](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/profile)**: Tracks all PancakeSwap Profile with teams, users, points and campaigns.

11. **[SmartChef](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/smartchef)**: Tracks all PancakeSwap SmartChef (a.k.a. Syrup Pools) with tokens and rewards.

12. **[Timelock](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/timelock)**: Tracks all PancakeSwap Timelock queued, executed, and cancelled transactions.

13. **[Trading Competition (v1)](https://thegraph.com/legacy-explorer/subgraph/pancakeswap/trading-competition-v1)**: Tracks all metrics for the Easter Battle (April 07—14, 2021).

14. **[MasterChef (v2)](https://thegraph.com/hosted-service/subgraph/pancakeswap/masterchef-v2)**: Tracks data for MasterChefV2.

15. **MasterChef (v3)**: Tracks data for MasterChefV3.

    - BSC https://thegraph.com/hosted-service/subgraph/pancakeswap/masterchef-v3-bsc
    - BSC testnet https://thegraph.com/hosted-service/subgraph/pancakeswap/masterchef-v3-chapel
    - ETH https://thegraph.com/hosted-service/subgraph/pancakeswap/masterchef-v3-eth
    - GOR https://thegraph.com/hosted-service/subgraph/pancakeswap/masterchef-v3-goerli
    - Polygon zkEVM https://api.studio.thegraph.com/query/45376/masterchef-v3-polygon-zkevm/version/latest
    - Polygon zkEVM testnet https://api.studio.thegraph.com/query/45376/masterchef-v3-zkevm-testnet/version/latest
    - ARB https://api.thegraph.com/subgraphs/name/pancakeswap/masterchef-v3-arb
    - zkSync https://api.studio.thegraph.com/query/45376/masterchef-v3-zksync/version/latest
    - Base https://api.studio.thegraph.com/query/45376/masterchef-v3-base/version/latest

16. **Exchange (v3)**: Tracks all PancakeSwap V3 Exchange data with price, volume, liquidity
    - BSC https://thegraph.com/hosted-service/subgraph/pancakeswap/exchange-v3-bsc
    - BSC testnet https://thegraph.com/hosted-service/subgraph/pancakeswap/exchange-v3-chapel
    - ETH https://thegraph.com/hosted-service/subgraph/pancakeswap/exchange-v3-eth
    - GOR https://thegraph.com/hosted-service/subgraph/pancakeswap/exchange-v3-goerli
    - ARB
      - Hosted https://thegraph.com/hosted-service/subgraph/pancakeswap/exchange-v3-arb
      - Studio https://api.studio.thegraph.com/query/45376/exchange-v3-arbitrum/version/latest
    - ARB GOR https://api.thegraph.com/subgraphs/name/chef-jojo/exhange-v3-arb-goerli
    - Polygon zkEVM https://api.studio.thegraph.com/query/45376/exchange-v3-polygon-zkevm/version/latest
    - Polygon zkEVM testnet https://api.studio.thegraph.com/query/45376/exchange-v3-polygon-zkevm-test/version/latest
    - zkSync https://api.studio.thegraph.com/query/45376/exchange-v3-zksync/version/latest
    - zkSync testnet https://api.studio.thegraph.com/query/45376/exchange-v3-zksync-testnet/version/latest
    - Linea https://graph-query.linea.build/subgraphs/name/pancakeswap/exchange-v3-linea
    - Base https://api.studio.thegraph.com/query/45376/exchange-v3-base/version/latest
    - Base testnet https://api.studio.thegraph.com/query/45376/exchange-v3-base-testnet/version/latest
    - Scroll https://api.studio.thegraph.com/query/45376/exchange-v3-scroll/version/latest
    - Scroll Sepolia https://api.studio.thegraph.com/query/45376/exchange-v3-scroll-sepolia/version/latest
    - opBNB https://opbnb-mainnet-graph.nodereal.io/subgraphs/name/pancakeswap/exchange-v3

## Dependencies

- [Graph CLI](https://github.com/graphprotocol/graph-cli)
  - Required to generate and build local GraphQL dependencies.

```shell
yarn global add @graphprotocol/graph-cli
```

## Deployment

For any of the subgraph: `blocks` as `[subgraph]`

1. Run the `cd subgraphs/[subgraph]` command to move to the subgraph directory.

2. Run the `yarn codegen` command to prepare the TypeScript sources for the GraphQL (generated/\*).

3. Run the `yarn build` command to build the subgraph, and check compilation errors before deploying.

4. Run `graph auth --product hosted-service '<ACCESS_TOKEN>'`

5. Deploy via `yarn deploy`.

## v1

To access subgraphs related to PancakeSwap v1 ecosystem ([article](https://pancakeswap.medium.com/the-great-migration-vote-4093cb3edf23)), use [`v1`](https://github.com/pancakeswap/pancake-subgraph/tree/v1) branch.
