import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import {
  Transfer,
  DelegatedPowerChanged,
} from "../generated/DydxToken/DydxToken"
import {
  ADDRESS_ZERO,
  COMMUNITY_TREASURY_CONTRACT_ADDRESS,
  changeUserTokenBalance,
  saveCommunityTreasuryTransaction,
  COMMUNITY_TREASURY_2_CONTRACT_ADDRESS,
  GRANTS_TREASURY_CONTRACT_ADDRESS,
  saveGrantsProgramTreasuryTransaction,
  saveBalances
} from './helpers';
import { handleDelegation, DYDXTokenType } from "./delegate";
import { updateHourlydYdXTokenExchangeRate } from "./common/timeseries";

export function handleTokenTransfer(event: Transfer): void {
  let from: Address = event.params.from;
  let to: Address = event.params.to;

  updateHourlydYdXTokenExchangeRate(event.block);

  if (from.equals(to)) {
    // ignore self-transfers
    return;
  }

  const amount = event.params.value;

  if (from.toHexString() != ADDRESS_ZERO) {
    // don't subtract from zero address on mints
    changeUserTokenBalance(from, amount, false);
  }

  changeUserTokenBalance(to, amount, true);
  saveBalances(to, from, amount, event.transaction.hash, event.block.timestamp);

  if (
    from.toHexString().toLowerCase() == COMMUNITY_TREASURY_CONTRACT_ADDRESS ||
    from.toHexString().toLowerCase() == COMMUNITY_TREASURY_2_CONTRACT_ADDRESS
  ) {
    saveCommunityTreasuryTransaction(
      to,
      from,
      amount,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.block.hash,
      event.transaction.hash
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
      event.transaction.hash
    );
  }
}

export function handleTokenDelegation(event: DelegatedPowerChanged): void {
  handleDelegation(event.params.user, event.params.amount, event.params.delegationType, DYDXTokenType.Token)
}

