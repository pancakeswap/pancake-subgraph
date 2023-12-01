/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { GaugeVoting } from "../generated/GaugeVoting/GaugeVoting";

export let GaugeVotingSC = GaugeVoting.bind(Address.fromString("0xD6f7C34e2FfBE1b8bFD40f5960aE269C596fF893"));

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);
