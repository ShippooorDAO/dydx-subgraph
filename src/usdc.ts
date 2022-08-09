import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/UsdcToken/UsdcToken";
import { ADDRESS_ZERO, COMMUNITY_TREASURY_2_CONTRACT_ADDRESS, COMMUNITY_TREASURY_CONTRACT_ADDRESS, GRANTS_TREASURY_CONTRACT_ADDRESS, saveCommunityTreasuryTransaction, saveGrantsProgramTreasuryTransaction, saveUSDCBalances } from "./helpers";

export function handleUSDCTokenTransfer(event: Transfer): void {
  let from: Address = event.params.from;
  let to: Address = event.params.to;

  if (from == to) {
    // ignore self-transfers
    return;
  }

  const amount = event.params.value;

  saveUSDCBalances(to, from, amount, event.transaction.hash, event.block.timestamp);

  if (from == Address.fromString(COMMUNITY_TREASURY_CONTRACT_ADDRESS) 
    || from == Address.fromString(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS)) {
    saveCommunityTreasuryTransaction(
      to,
      from,
      amount,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.block.hash,
      event.transaction.hash,
      'usdc'
    );
  }

  if (from == Address.fromString(GRANTS_TREASURY_CONTRACT_ADDRESS)) {
    saveGrantsProgramTreasuryTransaction(
      to,
      from,
      amount,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.block.hash,
      event.transaction.hash,
      'usdc'
    );
  }
}
