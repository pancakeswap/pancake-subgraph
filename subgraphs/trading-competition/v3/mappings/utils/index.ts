/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Pair } from "../../generated/templates/Pair/Pair";

export let BI_ZERO = BigInt.fromI32(0);
export let BI_ONE = BigInt.fromI32(1);
export let BD_ZERO = BigDecimal.fromString("0");
export let BD_1E18 = BigDecimal.fromString("1e18");

export const WBNB_BUSD = "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16";

export const MOBOX_BNB = "0x8fa59693458289914db0097f5f366d771b7a7c3f";
export const MOBOX_BUSD = "0x9a4e0660e658e7b4a284079c6c10a5ba74e13926";

export let TRACKED_TOKEN_BNB_PAIRS: string[] = [
  MOBOX_BNB,
  "0x0ed7e52944161450477ee417de9cd3a859b14fd0", // CAKE/BNB
];

export let TRACKED_TOKEN_BUSD_PAIRS: string[] = [
  MOBOX_BUSD,
  "0x804678fa97d91b974ec2af3c843270886528a9e6", // CAKE/BUSD
];

export function getBnbPriceInUSD(): BigDecimal {
  // Bind WBNB/BUSD contract to query the pair.
  let pairContract = Pair.bind(Address.fromString(WBNB_BUSD));

  // Fail-safe call to get BNB price as BUSD.
  let reserves = pairContract.try_getReserves();
  if (!reserves.reverted) {
    let reserve0 = reserves.value.value0.toBigDecimal().div(BD_1E18);
    let reserve1 = reserves.value.value1.toBigDecimal().div(BD_1E18);

    if (reserve0.notEqual(BD_ZERO)) {
      return reserve1.div(reserve0);
    }
  }

  return BD_ZERO;
}
