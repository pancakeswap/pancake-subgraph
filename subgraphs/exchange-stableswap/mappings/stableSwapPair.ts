/* eslint-disable prefer-const */
import { log, Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Pair } from "../generated/schema";
import {
  StableSwapPair,
  AddLiquidity,
  RemoveLiquidity,
  RemoveLiquidityOne,
  TokenExchange,
} from "../generated/templates/StableSwapPair/StableSwapPair";

const updateVirtualPrice = (address: Address): void => {
  let pair = Pair.load(address.toHex());
  if (pair === null) {
    log.error("Pair not found {}", [address.toHex()]);
    return;
  }
  let stableSwapPair = StableSwapPair.bind(address);
  let vp = stableSwapPair.get_virtual_price();
  pair.virtualPrice = BigInt.fromI32(vp as i32);
  pair.save();
};

export function handleAddLiquidity(event: AddLiquidity): void {
  log.info("handleAddLiquidity. address: {}", [event.address.toHex()]);
  updateVirtualPrice(event.address);
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  log.info("handleRemoveLiquidity. address: {}", [event.address.toHex()]);
  updateVirtualPrice(event.address);
}

export function handleRemoveLiquidityOne(event: RemoveLiquidityOne): void {
  log.info("handleRemoveLiquidityOne. address: {}", [event.address.toHex()]);
  updateVirtualPrice(event.address);
}

export function handleTokenExchange(event: TokenExchange): void {
  log.info("handleTokenExchange. address: {}", [event.address.toHex()]);
  updateVirtualPrice(event.address);
}
