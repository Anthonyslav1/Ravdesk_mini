import { Address } from 'viem';
import { ABI } from './abi';

// Contract configuration
// Deprecated: no centralized escrow address. Contracts are created per-user.
// Keep a zero-address placeholder to satisfy types where needed.
export const RAVDESK_ESCROW_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

export const escrowContract = {
  address: RAVDESK_ESCROW_ADDRESS,
  abi: ABI,
} as const;

// Contract function names for type safety
export const CONTRACT_FUNCTIONS = {
  deposit: 'deposit',
  completeMilestone: 'completeMilestone',
  timeLockRelease: 'timeLockRelease',
  cancelContract: 'cancelContract',
  getTotalAmount: 'getTotalAmount',
  getMilestoneInfo: 'getMilestoneInfo',
  getContractState: 'getContractState',
  isTimeLock: 'isTimeLock',
  getCurrentMilestone: 'getCurrentMilestone',
  getMilestoneCount: 'getMilestoneCount',
} as const;

// Contract event names
export const CONTRACT_EVENTS = {
  ContractCreated: 'ContractCreated',
  MilestoneCompleted: 'MilestoneCompleted',
  ContractCancelled: 'ContractCancelled',
  FundsDeposited: 'FundsDeposited',
  FundsReleased: 'FundsReleased',
} as const;

// Contract state enum
export enum ContractState {
  Active = 0,
  Cancelled = 1,
  Completed = 2,
}
