import {
  AddType,
  NewGauge,
  NewGaugeWeight,
  NewTypeWeight,
  VoteForGauge,
  VoteForGaugeFromAdmin,
} from "../generated/GaugeVoting/GaugeVoting";
import { getOrCreateGaugeType } from "../utils/entity";
import { Gauge, GaugeTotalWeight, GaugeType, GaugeTypeWeight, GaugeVote, GaugeWeight, User } from "../generated/schema";
import { GaugeVotingSC, ONE_BI } from "../utils/constants";
import { nextPeriod, TWO_WEEKS } from "../utils/time";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleAddType(event: AddType): void {
  let gaugeType = getOrCreateGaugeType(event.params.type_id.toString(), event.params.name);

  let nextWeek = nextPeriod(event.block.timestamp, TWO_WEEKS);

  // Save gauge type weight
  let typeWeight = new GaugeTypeWeight(nextWeek.toString());
  typeWeight.type = gaugeType.id;
  typeWeight.time = nextWeek;
  typeWeight.weight = GaugeVotingSC.gaugeTypePointsWeight(event.params.type_id, nextWeek);
  typeWeight.save();

  // Save total weight
  let totalWeight = new GaugeTotalWeight(nextWeek.toString());
  totalWeight.time = nextWeek;
  //TODO inCap?
  totalWeight.weight = GaugeVotingSC.getTotalWeight(false);
  totalWeight.save();
}

export function handleNewGauge(event: NewGauge): void {
  let nextWeek = nextPeriod(event.block.timestamp, TWO_WEEKS);

  let gaugeType = GaugeType.load(event.params.gauge_type.toString());
  if (gaugeType == null) {
    gaugeType = getOrCreateGaugeType(
      event.params.gauge_type.toString(),
      GaugeVotingSC.gaugeTypeNames(event.params.gauge_type)
    );
  }
  gaugeType.gaugeCount = gaugeType.gaugeCount.plus(ONE_BI);
  gaugeType.save();

  let id = event.params.hash.toHexString();
  let gauge = new Gauge(id);
  gauge.gaugeType = gaugeType.id;
  gauge.pid = event.params.pid;
  gauge.masterChef = event.params.masterChef;
  gauge.chainId = event.params.chainId;
  gauge.boostMultiplier = event.params.boostMultiplier;
  gauge.maxVoteCap = event.params.maxVoteCap;

  gauge.save();

  // Save gauge weight
  let gaugeWeight = new GaugeWeight(gauge.id + "-" + nextWeek.toString());
  gaugeWeight.gauge = gauge.id;
  gaugeWeight.time = nextWeek;
  gaugeWeight.weight = event.params.weight;
  gaugeWeight.save();

  // Save total weight
  let totalWeight = new GaugeTotalWeight(nextWeek.toString());
  totalWeight.time = nextWeek;
  //TODO inCap?
  totalWeight.weight = GaugeVotingSC.getTotalWeight(false);
  totalWeight.save();
}

export function handleNewGaugeWeight(event: NewGaugeWeight): void {
  let id = event.params.hash.toHexString();
  let gauge = Gauge.load(id);
  if (gauge) {
    let nextWeek = nextPeriod(event.params.time, TWO_WEEKS);
    // Save gauge weight
    let gaugeWeight = new GaugeWeight(gauge.id + "-" + nextWeek.toString());
    gaugeWeight.gauge = gauge.id;
    gaugeWeight.time = nextWeek;
    gaugeWeight.weight = event.params.weight;
    gaugeWeight.save();

    // Save total weight
    let totalWeight = new GaugeTotalWeight(nextWeek.toString());
    totalWeight.time = nextWeek;
    //TODO inCap?
    totalWeight.weight = GaugeVotingSC.getTotalWeight(false);
    totalWeight.save();
  }
}

export function handleNewTypeWeight(event: NewTypeWeight): void {
  let gaugeType = GaugeType.load(event.params.type_id.toString());

  if (gaugeType != null) {
    let typeWeight = new GaugeTypeWeight(gaugeType.id + "-" + event.params.time.toString());
    typeWeight.type = gaugeType.id;
    typeWeight.time = event.params.time;
    typeWeight.weight = event.params.weight;
    typeWeight.save();

    let totalWeight = new GaugeTotalWeight(event.params.time.toString());
    totalWeight.time = event.params.time;
    totalWeight.weight = event.params.total_weight;
    totalWeight.save();
  }
}

export function handleVoteForGauge(event: VoteForGauge): void {
  handleVote(event.params.weight, event.params.time, event.params.hash, event.params.user);
}

export function handleVoteForGaugeFromAdmin(event: VoteForGaugeFromAdmin): void {
  handleVote(event.params.weight, event.params.time, event.params.hash, event.params.user);
}

function handleVote(weight: BigInt, time: BigInt, hash: Bytes, userAddress: Address): void {
  let gauge = Gauge.load(hash.toHexString());

  if (gauge != null) {
    let nextWeek = nextPeriod(time, TWO_WEEKS);

    // Save gauge weight
    let gaugeWeight = new GaugeWeight(gauge.id + "-" + nextWeek.toString());
    gaugeWeight.gauge = gauge.id;
    gaugeWeight.time = nextWeek;
    gaugeWeight.weight = GaugeVotingSC.gaugePointsWeight(hash, nextWeek).value0;
    gaugeWeight.save();

    // Save total weight
    let totalWeight = new GaugeTotalWeight(nextWeek.toString());
    totalWeight.time = nextWeek;
    totalWeight.weight = GaugeVotingSC.gaugePointsTotal(nextWeek);
    totalWeight.save();

    // Save user's gauge weight vote
    let user = User.load(userAddress.toHex());
    if (user === null) {
      user = new User(userAddress.toHex());
      user.save();
    }

    let vote = new GaugeVote(gauge.id + "-" + user.id + "-" + time.toString());
    vote.gauge = gauge.id;
    vote.user = user.id;
    vote.time = time;
    vote.weight = weight;
    vote.save();
  }
}
