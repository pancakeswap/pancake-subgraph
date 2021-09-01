/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";

import { IERC721 } from "../../generated/ERC721NFTMarketV1/IERC721";

export function fetchCollectionName(collectionAddress: Address): string {
  let contract = IERC721.bind(collectionAddress);
  let nameValue = "unknown";
  let nameResult = contract.try_name();

  if (!nameResult.reverted) {
    nameValue = nameResult.value;
  }
  return nameValue;
}

export function fetchCollectionSymbol(collectionAddress: Address): string {
  let contract = IERC721.bind(collectionAddress);
  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();

  if (!symbolResult.reverted) {
    symbolValue = symbolResult.value;
  }
  return symbolValue;
}

export function fetchTokenURI(collectionAddress: Address, tokenId: BigInt): string {
  let contract = IERC721.bind(collectionAddress);
  let tokenURIValue = "unknown";
  let tokenURIResult = contract.try_tokenURI(tokenId);

  if (!tokenURIResult.reverted) {
    tokenURIValue = tokenURIResult.value;
  }
  return tokenURIValue;
}
