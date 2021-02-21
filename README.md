# PancakeSwap Subgraph

The Graph exposes a GraphQL endpoint to query the events and entities within the PancakeSwap ecosystem.

Currently, there are one subgraph, but additional subgraphs can be added to this repo:

1. **DexCandles**: Tracks all the PancakeSwap trades (event: `Swap`) with 5m / 15m / 1h / 4h / 1d / 1w candles.

## To setup and deploy

For any of the subgraph: `dexcandles` as `[subgraph]`

1. Run the `yarn run codegen:[subgraph]` command to prepare the TypeScript sources for the GraphQL (generated/*).

2. Run the `yarn run build:[subgraph]` command to build the subgraph, and check compilation errors before deploying.

3. Run `graph auth https://api.thegraph.com/deploy/ '<ACCESS_TOKEN>'`

4. Deploy via `yarn run deploy:[subgraph]`.
