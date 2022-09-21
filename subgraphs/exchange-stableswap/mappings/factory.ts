/* eslint-disable prefer-const */
import { DataSourceContext, log } from "@graphprotocol/graph-ts";
import { StableSwapPair as StableSwapPairContract } from "../generated/templates/StableSwapPair/StableSwapPair";
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO } from "./utils";
import { getOrCreateFactory, getOrCreateToken } from "./utils/data";
import { NewStableSwapPair } from "../generated/StableSwapFactory/StableSwapFactory";
import { ERC20, StableSwapPair } from "../generated/templates";
import { Pair } from "../generated/schema";

export function handlePairCreated(event: NewStableSwapPair): void {
  log.info("handlePairCreated. address: {}", [event.address.toHex()]);
  let pair = Pair.load(event.params.swapContract.toHex());
  if (pair === null) {
    let token0 = getOrCreateToken(event.params.tokenA);
    let token1 = getOrCreateToken(event.params.tokenB);

    pair = new Pair(event.params.swapContract.toHex());
    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.name = token0.symbol.concat("-").concat(token1.symbol);

    pair.token0Price = BIG_DECIMAL_ZERO;
    pair.token1Price = BIG_DECIMAL_ZERO;
    pair.volumeToken0 = BIG_DECIMAL_ZERO;
    pair.volumeToken1 = BIG_DECIMAL_ZERO;
    pair.volumeUSD = BIG_DECIMAL_ZERO;
    pair.totalTransactions = BIG_INT_ZERO;
    pair.reserve0 = BIG_DECIMAL_ZERO;
    pair.reserve1 = BIG_DECIMAL_ZERO;
    pair.trackedReserveBNB = BIG_DECIMAL_ZERO;
    pair.reserveBNB = BIG_DECIMAL_ZERO;
    pair.reserveUSD = BIG_DECIMAL_ZERO;
    pair.untrackedVolumeUSD = BIG_DECIMAL_ZERO;
    pair.totalSupply = BIG_DECIMAL_ZERO;

    pair.virtualPrice = BIG_DECIMAL_ZERO;
    pair.block = event.block.number;
    pair.timestamp = event.block.timestamp;

    pair.save();
  }

  let factory = getOrCreateFactory();
  factory.pairs = factory.pairs.concat([pair.id]);
  factory.totalPairs = factory.totalPairs.plus(BIG_INT_ONE);
  factory.save();

  StableSwapPair.create(event.params.swapContract);

  let context = new DataSourceContext();
  context.setString("pairAddress", event.params.swapContract.toHex());
  ERC20.createWithContext(StableSwapPairContract.bind(event.params.swapContract).token(), context);
}
