"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { MEGICULA_TOKEN_ABI, MEGICULA_STAKING_ABI } from "@/config/abis";

// ═══════════════════════════════════════════════════════════════
//  TOKEN HOOKS
// ═══════════════════════════════════════════════════════════════

export function useTokenBalance() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACTS.MEGICULA_TOKEN_ADDRESS as `0x${string}`,
    abi: MEGICULA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
}

export function useTokenAllowance() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACTS.MEGICULA_TOKEN_ADDRESS as `0x${string}`,
    abi: MEGICULA_TOKEN_ABI,
    functionName: "allowance",
    args: address
      ? [address, CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`]
      : undefined,
    query: { enabled: !!address },
  });
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: string) => {
    writeContract({
      address: CONTRACTS.MEGICULA_TOKEN_ADDRESS as `0x${string}`,
      abi: MEGICULA_TOKEN_ABI,
      functionName: "approve",
      args: [CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`, parseEther(amount)],
    });
  };

  return { approve, isPending, isConfirming, isSuccess, error, hash };
}

// ═══════════════════════════════════════════════════════════════
//  STAKING HOOKS (READS)
// ═══════════════════════════════════════════════════════════════

export function useStakingApy() {
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "apyBps",
    query: { refetchInterval: 30_000 },
  });
}

export function useTotalStaked() {
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "totalStaked",
    query: { refetchInterval: 5000 },
  });
}

export function useTotalStakers() {
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "totalStakers",
    query: { refetchInterval: 10_000 },
  });
}

export function useTotalRewardsDistributed() {
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "totalRewardsDistributed",
    query: { refetchInterval: 10_000 },
  });
}

export function useRewardPoolBalance() {
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "rewardPoolBalance",
    query: { refetchInterval: 10_000 },
  });
}

export function useIsPaused() {
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "paused",
    query: { refetchInterval: 15_000 },
  });
}

export function useUserInfo() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
}

export function usePendingRewards() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
    abi: MEGICULA_STAKING_ABI,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 3000 },
  });
}

// ═══════════════════════════════════════════════════════════════
//  STAKING HOOKS (WRITES)
// ═══════════════════════════════════════════════════════════════

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (amount: string) => {
    writeContract({
      address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
      abi: MEGICULA_STAKING_ABI,
      functionName: "stake",
      args: [parseEther(amount)],
    });
  };

  return { stake, isPending, isConfirming, isSuccess, error, hash };
}

export function useUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstake = (amount: string) => {
    writeContract({
      address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
      abi: MEGICULA_STAKING_ABI,
      functionName: "unstake",
      args: [parseEther(amount)],
    });
  };

  return { unstake, isPending, isConfirming, isSuccess, error, hash };
}

export function useClaimRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = () => {
    writeContract({
      address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
      abi: MEGICULA_STAKING_ABI,
      functionName: "claimRewards",
    });
  };

  return { claim, isPending, isConfirming, isSuccess, error, hash };
}

export function useEmergencyWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const emergencyWithdraw = () => {
    writeContract({
      address: CONTRACTS.MEGICULA_STAKING_ADDRESS as `0x${string}`,
      abi: MEGICULA_STAKING_ABI,
      functionName: "emergencyWithdraw",
    });
  };

  return { emergencyWithdraw, isPending, isConfirming, isSuccess, error, hash };
}
