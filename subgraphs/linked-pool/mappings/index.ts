/* eslint-disable prefer-const */
import { Swap } from "../generated/schema";
import { Swap as SwapEven } from "../generated/PancakeSwapMMPool/PancakeSwapMMPool";
import { convertTokenToDecimal, getOrCreateToken } from "../utils";

export function handleSwap(event: SwapEven): void {
  let id = event.transaction.hash
    .toHex()
    .concat("-")
    .concat(event.params.nonce.toString())
    .concat("-")
    .concat(event.params.mm.toHex())
    .concat("-")
    .concat(event.params.user.toHex());

  let swap = Swap.load(id);
  if (swap === null) {
    let baseToken = getOrCreateToken(event.params.baseToken);
    let quoteToken = getOrCreateToken(event.params.quoteToken);

    swap = new Swap(id);
    swap.user = event.params.user.toHex();
    swap.mm = event.params.mm.toHex();
    swap.nonce = event.params.nonce;
    swap.mmTreasury = event.params.mmTreasury.toHex();
    swap.baseToken = event.params.baseToken.toHex();
    swap.quoteToken = event.params.quoteToken.toHex();
    swap.baseTokenAmount = convertTokenToDecimal(event.params.baseTokenAmount, baseToken.decimals);
    swap.quoteTokenAmount = convertTokenToDecimal(event.params.quoteTokenAmount, quoteToken.decimals);
    swap.timestamp = event.block.timestamp;
    swap.save();
  }
}
