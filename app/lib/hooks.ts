import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { escrowContract, CONTRACT_FUNCTIONS, ContractState } from './contracts';

// Read hooks
export function useContractState() {
  return useReadContract({
    ...escrowContract,
    functionName: CONTRACT_FUNCTIONS.getContractState,
  });
}

export function useTotalAmount() {
  return useReadContract({
    ...escrowContract,
    functionName: CONTRACT_FUNCTIONS.getTotalAmount,
  });
}

export function useCurrentMilestone() {
  return useReadContract({
    ...escrowContract,
    functionName: CONTRACT_FUNCTIONS.getCurrentMilestone,
  });
}

export function useMilestoneCount() {
  return useReadContract({
    ...escrowContract,
    functionName: CONTRACT_FUNCTIONS.getMilestoneCount,
  });
}

export function useIsTimeLock() {
  return useReadContract({
    ...escrowContract,
    functionName: CONTRACT_FUNCTIONS.isTimeLock,
  });
}

export function useMilestoneInfo(milestoneIndex: number) {
  return useReadContract({
    ...escrowContract,
    functionName: CONTRACT_FUNCTIONS.getMilestoneInfo,
    args: [BigInt(milestoneIndex)],
  });
}

// Write hooks
export function useDeposit() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const deposit = async (amount: string) => {
    writeContract({
      ...escrowContract,
      functionName: CONTRACT_FUNCTIONS.deposit,
      value: parseEther(amount),
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    deposit,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useCompleteMilestone() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const completeMilestone = async (milestoneIndex: number) => {
    writeContract({
      ...escrowContract,
      functionName: CONTRACT_FUNCTIONS.completeMilestone,
      args: [BigInt(milestoneIndex)],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    completeMilestone,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useTimeLockRelease() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const timeLockRelease = async () => {
    writeContract({
      ...escrowContract,
      functionName: CONTRACT_FUNCTIONS.timeLockRelease,
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    timeLockRelease,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useCancelContract() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const cancelContract = async () => {
    writeContract({
      ...escrowContract,
      functionName: CONTRACT_FUNCTIONS.cancelContract,
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return {
    cancelContract,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Utility functions
export function formatContractAmount(amount: bigint | undefined): string {
  if (!amount) return '0';
  return formatEther(amount);
}

export function getContractStateLabel(state: number | undefined): string {
  if (state === undefined) return 'Unknown';
  switch (state) {
    case ContractState.Active:
      return 'Active';
    case ContractState.Cancelled:
      return 'Cancelled';
    case ContractState.Completed:
      return 'Complete';
    default:
      return 'Unknown';
  }
}
