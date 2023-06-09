/* eslint-disable prefer-const */
import { Swap } from "../generated/schema";
import { Swap as SwapEven } from "../generated/PancakeSwapMMPool/PancakeSwapMMPool";

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
    swap = new Swap(id);
    swap.user = event.params.user.toHex();
    swap.mm = event.params.mm.toHex();
    swap.nonce = event.params.nonce;
    swap.mmTreasury = event.params.mmTreasury.toHex();
    swap.baseToken = event.params.baseToken.toHex();
    swap.quoteToken = event.params.quoteToken.toHex();
    swap.baseTokenAmount = event.params.baseTokenAmount;
    swap.quoteTokenAmount = event.params.quoteTokenAmount;
    swap.timestamp = event.block.timestamp;
    swap.tx = event.transaction.hash;
    swap.block = event.block.number;
    swap.save();
  }
}
