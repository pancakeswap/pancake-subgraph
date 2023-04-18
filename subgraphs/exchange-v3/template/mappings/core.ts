/* eslint-disable prefer-const */
import { Bundle, Burn, Factory, Mint, Pool, Swap, Tick, Token, Collect } from "../generated/schema";
import { Pool as PoolABI } from "../generated/Factory/Pool";
import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Burn as BurnEvent,
  Flash as FlashEvent,
  Initialize,
  Mint as MintEvent,
  Swap as SwapEvent,
  Collect as CollectEvent,
  CollectProtocol as CollectProtocolEvent,
} from "../generated/templates/Pool/Pool";
import { convertTokenToDecimal, loadTransaction } from "../utils";
import { FACTORY_ADDRESS, ONE_BI, TWO_BD, ZERO_BD, ZERO_BI } from "../utils/constants";
import {
  AmountType,
  findEthPerToken,
  getAdjustedAmounts,
  getEthPriceInUSD,
  sqrtPriceX96ToTokenPrices,
} from "../utils/pricing";
import {
  updatePoolDayData,
  updatePoolHourData,
  updateTickDayData,
  updateTokenDayData,
  updateTokenHourData,
  updatePancakeDayData,
} from "../utils/intervalUpdates";
import { createTick, feeTierToTickSpacing } from "../utils/tick";
import { updateDerivedTVLAmounts } from "../utils/tvl";

export function handleInitialize(event: Initialize): void {
  // update pool sqrt price and tick
  let pool = Pool.load(event.address.toHexString());
  pool.sqrtPrice = event.params.sqrtPriceX96;
  pool.tick = BigInt.fromI32(event.params.tick);
  pool.save();

  // update token prices
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);

  // update ETH price now that prices could have changed
  let bundle = Bundle.load("1");
  bundle.ethPriceUSD = getEthPriceInUSD();
  bundle.save();

  updatePoolDayData(event);
  updatePoolHourData(event);

  // update token prices
  token0.derivedETH = findEthPerToken(token0 as Token);
  token1.derivedETH = findEthPerToken(token1 as Token);
  token0.save();
  token1.save();
}

export function handleMint(event: MintEvent): void {
  let bundle = Bundle.load("1");
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);
  let factory = Factory.load(FACTORY_ADDRESS);

  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)));

  // Update TVL values.
  let oldPoolTVLETH = pool.totalValueLockedETH;
  let oldPoolTVLETHUntracked = pool.totalValueLockedETHUntracked;
  token0.totalValueLocked = token0.totalValueLocked.plus(amount0);
  token1.totalValueLocked = token1.totalValueLocked.plus(amount1);
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1);
  updateDerivedTVLAmounts(
    pool as Pool,
    factory as Factory,
    token0 as Token,
    token1 as Token,
    oldPoolTVLETH,
    oldPoolTVLETHUntracked
  );

  // update tx counts
  factory.txCount = factory.txCount.plus(ONE_BI);
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);

  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on mint if the new position includes the current tick.
  if (
    pool.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.plus(event.params.amount);
  }

  pool.liquidityProviderCount = pool.liquidityProviderCount.plus(ONE_BI);

  let transaction = loadTransaction(event);
  let mint = new Mint(transaction.id.toString() + "#" + pool.txCount.toString());
  mint.transaction = transaction.id;
  mint.timestamp = transaction.timestamp;
  mint.pool = pool.id;
  mint.token0 = pool.token0;
  mint.token1 = pool.token1;
  mint.owner = event.params.owner;
  mint.sender = event.params.sender;
  mint.origin = event.transaction.from;
  mint.amount = event.params.amount;
  mint.amount0 = amount0;
  mint.amount1 = amount1;
  mint.amountUSD = amountUSD;
  mint.tickLower = BigInt.fromI32(event.params.tickLower);
  mint.tickUpper = BigInt.fromI32(event.params.tickUpper);
  mint.logIndex = event.logIndex;

  // tick entities
  let lowerTickIdx = event.params.tickLower;
  let upperTickIdx = event.params.tickUpper;

  let lowerTickId = poolAddress + "#" + BigInt.fromI32(event.params.tickLower).toString();
  let upperTickId = poolAddress + "#" + BigInt.fromI32(event.params.tickUpper).toString();

  let lowerTick = Tick.load(lowerTickId);
  let upperTick = Tick.load(upperTickId);

  if (lowerTick === null) {
    lowerTick = createTick(lowerTickId, lowerTickIdx, pool.id, event);
  }

  if (upperTick === null) {
    upperTick = createTick(upperTickId, upperTickIdx, pool.id, event);
  }

  let amount = event.params.amount;
  lowerTick.liquidityGross = lowerTick.liquidityGross.plus(amount);
  lowerTick.liquidityNet = lowerTick.liquidityNet.plus(amount);
  upperTick.liquidityGross = upperTick.liquidityGross.plus(amount);
  upperTick.liquidityNet = upperTick.liquidityNet.minus(amount);

  // TODO: Update Tick's volume, fees, and liquidity provider count. Computing these on the tick
  // level requires reimplementing some of the swapping code from v3-core.

  updatePancakeDayData(event);
  updatePoolDayData(event);
  updatePoolHourData(event);
  updateTokenDayData(token0 as Token, event);
  updateTokenDayData(token1 as Token, event);
  updateTokenHourData(token0 as Token, event);
  updateTokenHourData(token1 as Token, event);

  token0.save();
  token1.save();
  pool.save();
  factory.save();
  mint.save();

  // Update inner tick vars and save the ticks
  updateTickFeeVarsAndSave(lowerTick!, event);
  updateTickFeeVarsAndSave(upperTick!, event);
}

export function handleBurn(event: BurnEvent): void {
  let bundle = Bundle.load("1");
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);
  let factory = Factory.load(FACTORY_ADDRESS);

  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)));

  // tx update
  factory.txCount = factory.txCount.plus(ONE_BI);
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);

  // Update TVL values.
  let oldPoolTotalValueLockedETH = pool.totalValueLockedETH;
  let oldPoolTVLETHUntracked = pool.totalValueLockedETHUntracked;
  token0.totalValueLocked = token0.totalValueLocked.minus(amount0);
  token1.totalValueLocked = token1.totalValueLocked.minus(amount1);
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1);
  updateDerivedTVLAmounts(
    pool as Pool,
    factory as Factory,
    token0 as Token,
    token1 as Token,
    oldPoolTotalValueLockedETH,
    oldPoolTVLETHUntracked
  );

  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on burn if the position being burnt includes the current tick.
  if (
    pool.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.minus(event.params.amount);
  }

  // burn entity
  let transaction = loadTransaction(event);
  let burn = new Burn(transaction.id + "#" + pool.txCount.toString());
  burn.transaction = transaction.id;
  burn.timestamp = transaction.timestamp;
  burn.pool = pool.id;
  burn.token0 = pool.token0;
  burn.token1 = pool.token1;
  burn.owner = event.params.owner;
  burn.origin = event.transaction.from;
  burn.amount = event.params.amount;
  burn.amount0 = amount0;
  burn.amount1 = amount1;
  burn.amountUSD = amountUSD;
  burn.tickLower = BigInt.fromI32(event.params.tickLower);
  burn.tickUpper = BigInt.fromI32(event.params.tickUpper);
  burn.logIndex = event.logIndex;

  // tick entities
  let lowerTickId = poolAddress + "#" + BigInt.fromI32(event.params.tickLower).toString();
  let upperTickId = poolAddress + "#" + BigInt.fromI32(event.params.tickUpper).toString();
  let lowerTick = Tick.load(lowerTickId);
  let upperTick = Tick.load(upperTickId);
  let amount = event.params.amount;
  lowerTick.liquidityGross = lowerTick.liquidityGross.minus(amount);
  lowerTick.liquidityNet = lowerTick.liquidityNet.minus(amount);
  upperTick.liquidityGross = upperTick.liquidityGross.minus(amount);
  upperTick.liquidityNet = upperTick.liquidityNet.plus(amount);

  updatePancakeDayData(event);
  updatePoolDayData(event);
  updatePoolHourData(event);
  updateTokenDayData(token0 as Token, event);
  updateTokenDayData(token1 as Token, event);
  updateTokenHourData(token0 as Token, event);
  updateTokenHourData(token1 as Token, event);
  updateTickFeeVarsAndSave(lowerTick!, event);
  updateTickFeeVarsAndSave(upperTick!, event);

  token0.save();
  token1.save();
  pool.save();
  factory.save();
  burn.save();
}

export function handleSwap(event: SwapEvent): void {
  let bundle = Bundle.load("1");
  let factory = Factory.load(FACTORY_ADDRESS);
  let pool = Pool.load(event.address.toHexString());

  // // hot fix for bad pricing
  // if (pool.id == "0x9663f2ca0454accad3e094448ea6f77443880454") {
  //   return;
  // }

  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);

  let oldTick = pool.tick!;

  // amounts - 0/1 are token deltas: can be positive or negative
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let protocolFeeAmount0 = convertTokenToDecimal(event.params.protocolFeesToken0, token0.decimals);
  let protocolFeeAmount1 = convertTokenToDecimal(event.params.protocolFeesToken1, token1.decimals);

  // need absolute amounts for volume
  let amount0Abs = amount0.times(BigDecimal.fromString(amount0.lt(ZERO_BD) ? "-1" : "1"));
  let amount1Abs = amount1.times(BigDecimal.fromString(amount1.lt(ZERO_BD) ? "-1" : "1"));
  let volumeAmounts: AmountType = getAdjustedAmounts(amount0Abs, token0 as Token, amount1Abs, token1 as Token);
  let volumeETH = volumeAmounts.eth.div(TWO_BD);
  let volumeUSD = volumeAmounts.usd.div(TWO_BD);
  let volumeUSDUntracked = volumeAmounts.usdUntracked.div(TWO_BD);

  let protocolFeeAmounts: AmountType = getAdjustedAmounts(
    protocolFeeAmount0,
    token0 as Token,
    protocolFeeAmount1,
    token1 as Token
  );

  let feesETH = volumeETH.times(pool.feeTier.toBigDecimal()).div(BigDecimal.fromString("1000000"));
  let feesUSD = volumeUSD.times(pool.feeTier.toBigDecimal()).div(BigDecimal.fromString("1000000"));
  let feesProtocolETH = protocolFeeAmounts.eth;

  // global updates
  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.totalVolumeETH = factory.totalVolumeETH.plus(volumeETH);
  factory.totalVolumeUSD = factory.totalVolumeUSD.plus(volumeUSD);
  factory.untrackedVolumeUSD = factory.untrackedVolumeUSD.plus(volumeUSDUntracked);
  factory.totalFeesETH = factory.totalFeesETH.plus(feesETH);
  factory.totalFeesUSD = factory.totalFeesUSD.plus(feesUSD);
  factory.totalProtocolFeesETH = factory.totalProtocolFeesETH.plus(feesProtocolETH);
  factory.totalProtocolFeesUSD = factory.totalProtocolFeesUSD.plus(protocolFeeAmounts.usd);

  // pool volume
  pool.volumeToken0 = pool.volumeToken0.plus(amount0Abs);
  pool.volumeToken1 = pool.volumeToken1.plus(amount1Abs);
  pool.volumeUSD = pool.volumeUSD.plus(volumeUSD);
  pool.untrackedVolumeUSD = pool.untrackedVolumeUSD.plus(volumeUSDUntracked);
  pool.feesUSD = pool.feesUSD.plus(feesUSD);
  pool.protocolFeesUSD = pool.protocolFeesUSD.plus(protocolFeeAmounts.usd);
  pool.txCount = pool.txCount.plus(ONE_BI);

  // Update the pool with the new active liquidity, price, and tick.
  pool.liquidity = event.params.liquidity;
  pool.tick = BigInt.fromI32(event.params.tick as i32);
  pool.sqrtPrice = event.params.sqrtPriceX96;

  // update token0 data
  token0.volume = token0.volume.plus(amount0Abs);
  token0.volumeUSD = token0.volumeUSD.plus(volumeUSD);
  token0.untrackedVolumeUSD = token0.untrackedVolumeUSD.plus(volumeUSDUntracked);
  token0.feesUSD = token0.feesUSD.plus(feesUSD);
  token0.protocolFeesUSD = token0.protocolFeesUSD.plus(protocolFeeAmounts.usd);
  token0.txCount = token0.txCount.plus(ONE_BI);

  // update token1 data
  token1.volume = token1.volume.plus(amount1Abs);
  token1.volumeUSD = token1.volumeUSD.plus(volumeUSD);
  token1.untrackedVolumeUSD = token1.untrackedVolumeUSD.plus(volumeUSDUntracked);
  token1.feesUSD = token1.feesUSD.plus(feesUSD);
  token1.protocolFeesUSD = token1.protocolFeesUSD.plus(protocolFeeAmounts.usd);
  token1.txCount = token1.txCount.plus(ONE_BI);

  // updated pool ratess
  let prices = sqrtPriceX96ToTokenPrices(pool.sqrtPrice, token0 as Token, token1 as Token);
  pool.token0Price = prices[0];
  pool.token1Price = prices[1];
  pool.save();

  // update USD pricing
  bundle.ethPriceUSD = getEthPriceInUSD();
  bundle.save();
  token0.derivedETH = findEthPerToken(token0 as Token);
  token1.derivedETH = findEthPerToken(token1 as Token);
  token0.derivedUSD = token0.derivedETH.times(bundle.ethPriceUSD);
  token1.derivedUSD = token1.derivedETH.times(bundle.ethPriceUSD);

  // Update TVL values.
  let oldPoolTVLETH = pool.totalValueLockedETH;
  let oldPoolTVLETHUntracked = pool.totalValueLockedETHUntracked;
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1);
  token0.totalValueLocked = token0.totalValueLocked.plus(amount0);
  token1.totalValueLocked = token1.totalValueLocked.plus(amount1);
  updateDerivedTVLAmounts(
    pool as Pool,
    factory as Factory,
    token0 as Token,
    token1 as Token,
    oldPoolTVLETH,
    oldPoolTVLETHUntracked
  );

  // create Swap event
  let transaction = loadTransaction(event);
  let swap = new Swap(transaction.id + "#" + pool.txCount.toString());
  swap.transaction = transaction.id;
  swap.timestamp = transaction.timestamp;
  swap.pool = pool.id;
  swap.token0 = pool.token0;
  swap.token1 = pool.token1;
  swap.sender = event.params.sender;
  swap.origin = event.transaction.from;
  swap.recipient = event.params.recipient;
  swap.amount0 = amount0;
  swap.amount1 = amount1;
  swap.amountUSD = volumeUSD;
  swap.amountFeeUSD = protocolFeeAmounts.usd;
  swap.tick = BigInt.fromI32(event.params.tick as i32);
  swap.sqrtPriceX96 = event.params.sqrtPriceX96;
  swap.logIndex = event.logIndex;

  // update fee growth
  let poolContract = PoolABI.bind(event.address);
  let feeGrowthGlobal0X128 = poolContract.feeGrowthGlobal0X128();
  let feeGrowthGlobal1X128 = poolContract.feeGrowthGlobal1X128();
  pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128 as BigInt;
  pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128 as BigInt;

  // interval data
  let pancakeDayData = updatePancakeDayData(event);
  let poolDayData = updatePoolDayData(event);
  let poolHourData = updatePoolHourData(event);
  let token0DayData = updateTokenDayData(token0 as Token, event);
  let token1DayData = updateTokenDayData(token1 as Token, event);
  let token0HourData = updateTokenHourData(token0 as Token, event);
  let token1HourData = updateTokenHourData(token1 as Token, event);

  // update volume metrics
  pancakeDayData.volumeETH = pancakeDayData.volumeETH.plus(volumeETH);
  pancakeDayData.volumeUSD = pancakeDayData.volumeUSD.plus(volumeUSD);
  pancakeDayData.feesUSD = pancakeDayData.feesUSD.plus(feesUSD);
  pancakeDayData.protocolFeesUSD = pancakeDayData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  poolDayData.volumeUSD = poolDayData.volumeUSD.plus(volumeUSD);
  poolDayData.volumeToken0 = poolDayData.volumeToken0.plus(amount0Abs);
  poolDayData.volumeToken1 = poolDayData.volumeToken1.plus(amount1Abs);
  poolDayData.feesUSD = poolDayData.feesUSD.plus(feesUSD);
  poolDayData.protocolFeesUSD = poolDayData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  poolHourData.volumeUSD = poolHourData.volumeUSD.plus(volumeUSD);
  poolHourData.volumeToken0 = poolHourData.volumeToken0.plus(amount0Abs);
  poolHourData.volumeToken1 = poolHourData.volumeToken1.plus(amount1Abs);
  poolHourData.feesUSD = poolHourData.feesUSD.plus(feesUSD);
  poolHourData.protocolFeesUSD = poolHourData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  token0DayData.volume = token0DayData.volume.plus(amount0Abs);
  token0DayData.volumeUSD = token0DayData.volumeUSD.plus(volumeUSD);
  token0DayData.untrackedVolumeUSD = token0DayData.untrackedVolumeUSD.plus(volumeUSDUntracked);
  token0DayData.feesUSD = token0DayData.feesUSD.plus(feesUSD);
  token0DayData.protocolFeesUSD = token0DayData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  token0HourData.volume = token0HourData.volume.plus(amount0Abs);
  token0HourData.volumeUSD = token0HourData.volumeUSD.plus(volumeUSD);
  token0HourData.untrackedVolumeUSD = token0HourData.untrackedVolumeUSD.plus(volumeUSDUntracked);
  token0HourData.feesUSD = token0HourData.feesUSD.plus(feesUSD);
  token0HourData.protocolFeesUSD = token0HourData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  token1DayData.volume = token1DayData.volume.plus(amount1Abs);
  token1DayData.volumeUSD = token1DayData.volumeUSD.plus(volumeUSD);
  token1DayData.untrackedVolumeUSD = token1DayData.untrackedVolumeUSD.plus(volumeUSDUntracked);
  token1DayData.feesUSD = token1DayData.feesUSD.plus(feesUSD);
  token1DayData.protocolFeesUSD = token1DayData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  token1HourData.volume = token1HourData.volume.plus(amount1Abs);
  token1HourData.volumeUSD = token1HourData.volumeUSD.plus(volumeUSD);
  token1HourData.untrackedVolumeUSD = token1HourData.untrackedVolumeUSD.plus(volumeUSDUntracked);
  token1HourData.feesUSD = token1HourData.feesUSD.plus(feesUSD);
  token1HourData.protocolFeesUSD = token1HourData.protocolFeesUSD.plus(protocolFeeAmounts.usd);

  swap.save();
  factory.save();
  pancakeDayData.save();
  pool.save();
  poolDayData.save();
  poolHourData.save();
  token0DayData.save();
  token1DayData.save();
  token0HourData.save();
  token1HourData.save();
  token0.save();
  token1.save();

  // Update inner vars of current or crossed ticks
  let newTick = pool.tick!;
  let tickSpacing = feeTierToTickSpacing(pool.feeTier);
  let modulo = newTick.mod(tickSpacing);
  if (modulo.equals(ZERO_BI)) {
    // Current tick is initialized and needs to be updated
    loadTickUpdateFeeVarsAndSave(newTick.toI32(), event);
  }

  let numIters = oldTick.minus(newTick).abs().div(tickSpacing);

  if (numIters.gt(BigInt.fromI32(100))) {
    // In case more than 100 ticks need to be updated ignore the update in
    // order to avoid timeouts. From testing this behavior occurs only upon
    // pool initialization. This should not be a big issue as the ticks get
    // updated later. For early users this error also disappears when calling
    // collect
  } else if (newTick.gt(oldTick)) {
    let firstInitialized = oldTick.plus(tickSpacing.minus(modulo));
    for (let i = firstInitialized; i.le(newTick); i = i.plus(tickSpacing)) {
      loadTickUpdateFeeVarsAndSave(i.toI32(), event);
    }
  } else if (newTick.lt(oldTick)) {
    let firstInitialized = oldTick.minus(modulo);
    for (let i = firstInitialized; i.ge(newTick); i = i.minus(tickSpacing)) {
      loadTickUpdateFeeVarsAndSave(i.toI32(), event);
    }
  }
}

export function handleFlash(event: FlashEvent): void {
  // update fee growth
  let pool = Pool.load(event.address.toHexString());
  let poolContract = PoolABI.bind(event.address);
  let feeGrowthGlobal0X128 = poolContract.feeGrowthGlobal0X128();
  let feeGrowthGlobal1X128 = poolContract.feeGrowthGlobal1X128();
  pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128 as BigInt;
  pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128 as BigInt;
  pool.save();
}

function updateTickFeeVarsAndSave(tick: Tick, event: ethereum.Event): void {
  let poolAddress = event.address;
  // not all ticks are initialized so obtaining null is expected behavior
  let poolContract = PoolABI.bind(poolAddress);
  let tickResult = poolContract.ticks(tick.tickIdx.toI32());
  tick.feeGrowthOutside0X128 = tickResult.value2;
  tick.feeGrowthOutside1X128 = tickResult.value3;
  tick.save();

  updateTickDayData(tick!, event);
}

function loadTickUpdateFeeVarsAndSave(tickId: i32, event: ethereum.Event): void {
  let poolAddress = event.address;
  let tick = Tick.load(poolAddress.toHexString().concat("#").concat(tickId.toString()));
  if (tick !== null) {
    updateTickFeeVarsAndSave(tick!, event);
  }
}

export function handleCollect(event: CollectEvent): void {
  // update fee growth
  let pool = Pool.load(event.address.toHexString());
  let factory = Factory.load(FACTORY_ADDRESS);
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);
  let transaction = loadTransaction(event);

  // Get formatted amounts collected.
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let amounts: AmountType = getAdjustedAmounts(
    // Used for USD in Collect event.
    amount0,
    token0 as Token,
    amount1,
    token1 as Token
  );

  // commented to avoid double counting as burn event is emitted with same amount
  // // Adjust pool TVL based on amount collected.
  // let oldPoolTVLETH = pool.totalValueLockedETH;
  // let oldPoolTVLETHUntracked = pool.totalValueLockedETHUntracked;
  // pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0);
  // pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1);
  // token0.totalValueLocked = token0.totalValueLocked.minus(amount0);
  // token1.totalValueLocked = token1.totalValueLocked.minus(amount1);
  // updateDerivedTVLAmounts(pool as Pool, factory as Factory, oldPoolTVLETH, oldPoolTVLETHUntracked);

  // Update aggregate fee collection values.
  pool.collectedFeesToken0 = pool.collectedFeesToken0.plus(amount0);
  pool.collectedFeesToken1 = pool.collectedFeesToken1.plus(amount1);
  pool.collectedFeesUSD = pool.collectedFeesUSD.plus(amounts.usd);

  // Update transaction counts.
  factory.txCount = factory.txCount.plus(ONE_BI);
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);

  let collectID = transaction.id.toString() + "#" + pool.txCount.toString();
  let collect = new Collect(collectID);
  collect.transaction = transaction.id;
  collect.timestamp = event.block.timestamp;
  collect.pool = pool.id;
  collect.owner = event.params.owner;
  collect.amount0 = amount0;
  collect.amount1 = amount1;
  collect.amountUSD = amounts.usd;
  collect.tickLower = BigInt.fromI32(event.params.tickLower);
  collect.tickUpper = BigInt.fromI32(event.params.tickUpper);
  collect.logIndex = event.logIndex;

  token0.save();
  token1.save();
  factory.save();
  pool.save();
  collect.save();
}

export function handleCollectProtocol(event: CollectProtocolEvent): void {
  // update fee growth
  let pool = Pool.load(event.address.toHexString());
  let factory = Factory.load(FACTORY_ADDRESS);
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);

  // Get formatted amounts collected.
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  // Adjust pool TVL based on amount collected.
  let oldPoolTVLETH = pool.totalValueLockedETH;
  let oldPoolTVLETHUntracked = pool.totalValueLockedETHUntracked;
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1);
  token0.totalValueLocked = token0.totalValueLocked.minus(amount0);
  token1.totalValueLocked = token1.totalValueLocked.minus(amount1);
  updateDerivedTVLAmounts(
    pool as Pool,
    factory as Factory,
    token0 as Token,
    token1 as Token,
    oldPoolTVLETH,
    oldPoolTVLETHUntracked
  );

  // Update transaction counts.
  factory.txCount = factory.txCount.plus(ONE_BI);
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);

  token0.save();
  token1.save();
  factory.save();
  pool.save();
}
