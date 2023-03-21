/* eslint-disable prefer-const */
import { BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { concat } from "@graphprotocol/graph-ts/helper-functions";
import { Lottery, Round, User } from "../generated/schema";
import {
  LotteryClose,
  LotteryNumberDrawn,
  LotteryOpen,
  TicketsClaim,
  TicketsPurchase,
} from "../generated/Lottery/Lottery";
import { toBigDecimal } from "./utils";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");

export function handleLotteryOpen(event: LotteryOpen): void {
  let lottery = new Lottery(event.params.lotteryId.toString());
  lottery.totalUsers = ZERO_BI;
  lottery.totalTickets = ZERO_BI;
  lottery.status = "Open";
  lottery.startTime = event.params.startTime;
  lottery.endTime = event.params.endTime;
  lottery.ticketPrice = toBigDecimal(event.params.priceTicketInCake);
  lottery.firstTicket = event.params.firstTicketId;
  lottery.block = event.block.number;
  lottery.timestamp = event.block.timestamp;
  lottery.save();
}

export function handleLotteryClose(event: LotteryClose): void {
  let lottery = new Lottery(event.params.lotteryId.toString());
  if (lottery !== null) {
    lottery.status = "Close";
    lottery.lastTicket = event.params.firstTicketIdNextLottery;
    lottery.save();
  }
}

export function handleLotteryNumberDrawn(event: LotteryNumberDrawn): void {
  let lottery = new Lottery(event.params.lotteryId.toString());
  if (lottery !== null) {
    lottery.status = "Claimable";
    lottery.finalNumber = event.params.finalNumber;
    lottery.winningTickets = event.params.countWinningTickets;
    lottery.claimedTickets = ZERO_BI;
    lottery.save();
  }
}

export function handleTicketsPurchase(event: TicketsPurchase): void {
  let lottery = Lottery.load(event.params.lotteryId.toString());
  if (lottery === null) {
    log.warning("Trying to purchase tickets for an unknown lottery - #{}", [event.params.lotteryId.toString()]);
  }
  lottery.totalTickets = lottery.totalTickets.plus(event.params.numberTickets);
  lottery.save();

  let user = User.load(event.params.buyer.toHex());
  if (user === null) {
    user = new User(event.params.buyer.toHex());
    user.totalRounds = ZERO_BI;
    user.totalTickets = ZERO_BI;
    user.totalCake = ZERO_BD;
    user.block = event.block.number;
    user.timestamp = event.block.timestamp;
    user.save();
  }
  user.totalTickets = user.totalTickets.plus(event.params.numberTickets);
  user.totalCake = user.totalCake.plus(event.params.numberTickets.toBigDecimal().times(lottery.ticketPrice));
  user.save();

  let roundId = concat(
    Bytes.fromHexString(event.params.buyer.toHex()),
    Bytes.fromUTF8(event.params.lotteryId.toString())
  ).toHex();
  let round = Round.load(roundId);
  if (round === null) {
    round = new Round(roundId);
    round.lottery = event.params.lotteryId.toString();
    round.user = event.params.buyer.toHex();
    round.totalTickets = ZERO_BI;
    round.block = event.block.number;
    round.timestamp = event.block.timestamp;
    round.save();

    user.totalRounds = user.totalRounds.plus(ONE_BI);
    user.save();

    lottery.totalUsers = lottery.totalUsers.plus(ONE_BI);
    lottery.save();
  }
  round.totalTickets = round.totalTickets.plus(event.params.numberTickets);
  round.save();
}

export function handleTicketsClaim(event: TicketsClaim): void {
  let lottery = Lottery.load(event.params.lotteryId.toString());
  if (lottery !== null) {
    lottery.claimedTickets = lottery.claimedTickets.plus(event.params.numberTickets);
    lottery.save();
  }

  let user = User.load(event.params.claimer.toHex());
  if (user !== null) {
    user.totalCake = user.totalCake.plus(toBigDecimal(event.params.amount));
    user.save();
  }

  let roundId = concat(
    Bytes.fromHexString(event.params.claimer.toHex()),
    Bytes.fromUTF8(event.params.lotteryId.toString())
  ).toHex();
  let round = Round.load(roundId);
  if (round !== null) {
    round.claimed = true;
    round.save();
  }
}
