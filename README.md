# PancakeSwap Subgraph

The Graph exposes a GraphQL endpoint to query the events and entities within the Binance Smart Chain and PancakeSwap ecosystem.

Currently, there are multiple subgraphs, but additional subgraphs can be added to this repo:

1. **[Blocks](https://thegraph.com/explorer/subgraph/pancakeswap/blocks)**: Tracks all the blocks on Binance Smart Chain.

2. **[Exchange](https://thegraph.com/explorer/subgraph/pancakeswap/exchange)**: Tracks all PancakeSwap Exchange data with price, volume, liquidity, ...

3. **[DexCandles](https://thegraph.com/explorer/subgraph/pancakeswap/dex-candles)**: Tracks all the PancakeSwap trades (event: `Swap`) with 5m / 15m / 1h / 4h / 1d / 1w candles.

4. **[Profile](https://thegraph.com/explorer/subgraph/pancakeswap/profile)**: Tracks all the PancakeSwap Profile with teams, users, points and campaign.

5. **[Timelock](https://thegraph.com/explorer/subgraph/pancakeswap/timelock)**: Tracks all the timelock transactions queued, executed, and cancelled.

## To setup and deploy

For any of the subgraph: `blocks` as `[subgraph]`

1. Run the `yarn run codegen:[subgraph]` command to prepare the TypeScript sources for the GraphQL (generated/*).

2. Run the `yarn run build:[subgraph]` command to build the subgraph, and check compilation errors before deploying.

3. Run `graph auth https://api.thegraph.com/deploy/ '<ACCESS_TOKEN>'`

4. Deploy via `yarn run deploy:[subgraph]`.
