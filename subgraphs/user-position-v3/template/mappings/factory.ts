/* eslint-disable prefer-const */
import { log } from "@graphprotocol/graph-ts";
import { PoolCreated } from "../generated/Factory/Factory";
import { Pool, Token } from "../generated/schema";
import { Pool as PoolTemplate } from "../generated/templates";
import { fetchTokenSymbol, fetchTokenName, fetchTokenDecimals } from "../utils/token";
import { ZERO_BI } from "../utils/constants";

export function handlePoolCreated(event: PoolCreated): void {
  let pool = new Pool(event.params.pool.toHexString()) as Pool;
  let token0 = Token.load(event.params.token0.toHexString());
  let token1 = Token.load(event.params.token1.toHexString());

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.token0.toHexString());
    token0.symbol = fetchTokenSymbol(event.params.token0);
    token0.name = fetchTokenName(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug("mybug the decimal on token 0 was null", []);
      return;
    }

    token0.decimals = decimals;
  }

  if (token1 === null) {
    token1 = new Token(event.params.token1.toHexString());
    token1.symbol = fetchTokenSymbol(event.params.token1);
    token1.name = fetchTokenName(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug("mybug the decimal on token 0 was null", []);
      return;
    }
    token1.decimals = decimals;
  }

  pool.token0 = token0.id;
  pool.token1 = token1.id;
  pool.txCount = ZERO_BI;
  pool.createdAtTimestamp = event.block.timestamp;
  pool.createdAtBlockNumber = event.block.number;

  pool.save();
  // create the tracked contract based on the template
  PoolTemplate.create(event.params.pool);
  token0.save();
  token1.save();
}
