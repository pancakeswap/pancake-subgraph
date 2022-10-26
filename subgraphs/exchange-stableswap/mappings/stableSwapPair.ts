/* eslint-disable prefer-const */
import { Address, log } from "@graphprotocol/graph-ts";
import { Pair } from "../generated/schema";
import {
  AddLiquidity,
  RemoveLiquidity,
  RemoveLiquidityOne,
  StableSwapPair,
  TokenExchange,
} from "../generated/templates/StableSwapPair/StableSwapPair";
import { BIG_DECIMAL_ZERO } from "./utils";

const updateVirtualPrice = (address: Address): void => {
  let pair = Pair.load(address.toHex());
  if (pair === null) {
    log.error("Pair not found {}", [address.toHex()]);
    return;
  }
  let stableSwapPair = StableSwapPair.bind(address);
  let virtualPriceResult = stableSwapPair.try_get_virtual_price();
  let vPrice = BIG_DECIMAL_ZERO;
  if (virtualPriceResult.reverted) {
    log.warning("Unable to fetch virtual price for pair {}", [pair.id]);
  } else {
    vPrice = virtualPriceResult.value.toBigDecimal();
  }
  pair.virtualPrice = vPrice;
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
