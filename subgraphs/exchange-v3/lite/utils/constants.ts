/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { Factory as FactoryContract } from "../generated/templates/Pool/Factory";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// prettier-ignore
export const FACTORY_ADDRESS = "0xbf12bb25090505045be1884538cbdfffa348d714";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS));
