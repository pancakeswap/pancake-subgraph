/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Pair } from "../../generated/templates/Pair/Pair";

export let BI_ZERO = BigInt.fromI32(0);
export let BI_ONE = BigInt.fromI32(1);
export let BD_ZERO = BigDecimal.fromString("0");
export let BD_1E18 = BigDecimal.fromString("1e18");

export const WBNB_BUSD = "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16";

export let TRACKED_TOKEN_BNB_PAIRS: string[] = [
  "0x11c0b2bb4fbb430825d07507a9e24e4c32f7704d", // LAZIO/BNB
  "0x0a292e96abb35297786a38fdd67dc4f82689e670", // PORTO/BNB
  "0x06043b346450bbcfde066ebc39fdc264fdffed74", // SANTOS/BNB
  "0x0ed7e52944161450477ee417de9cd3a859b14fd0", // CAKE/BNB
];

export let TRACKED_TOKEN_BUSD_PAIRS: string[] = [
  "0xdc49a4d0ccb2615a4d44d908d92dd79866d12ed5", // LAZIO/BUSD
  "0xc9e0b6eb78ff5c28fbb112f4f7cca7cfbc03e4ec", // PORTO/BUSD
  "0x2ac135e73babdd747e18dcfc14583c9cbe624085", // SANTOS/BUSD
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
