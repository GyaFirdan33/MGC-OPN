"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Gift,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Clock,
  BarChart3,
  Coins,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/header";
import {
  useTokenBalance,
  useTokenAllowance,
  useApproveToken,
  useStakingApy,
  useTotalStaked,
  useTotalStakers,
  useTotalRewardsDistributed,
  useUserInfo,
  usePendingRewards,
  useStake,
  useUnstake,
  useClaimRewards,
  useEmergencyWithdraw,
} from "@/lib/hooks";
import {
  formatToken,
  formatCompact,
  truncateAddress,
  formatTimestamp,
  apyFromBps,
  cn,
} from "@/lib/utils";
import { parseEther } from "viem";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function StakePage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <StakeDashboard />
      </div>
    </>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────

function StakeDashboard() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Wallet className="mx-auto mb-6 h-16 w-16 text-primary/50" />
          <h2 className="mb-3 text-2xl font-bold">Connect Your Wallet</h2>
          <p className="mb-8 text-muted-foreground">
            Connect your wallet to start staking MEGA tokens.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Staking Dashboard</h1>
        <p className="text-muted-foreground">
          Stake MEGA tokens and earn passive rewards on OPN Testnet.
        </p>
      </div>

      {/* Stats grid */}
      <StatsGrid />

      {/* Main content: staking panel + info */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StakingPanel />
        </div>
        <div className="lg:col-span-2">
          <UserInfoCard />
        </div>
      </div>
    </div>
  );
}

// ─── Stats Grid ──────────────────────────────────────────────

function StatsGrid() {
  const { data: tvl } = useTotalStaked();
  const { data: stakers } = useTotalStakers();
  const { data: rewards } = useTotalRewardsDistributed();
  const { data: apyBps } = useStakingApy();

  const stats = [
    {
      icon: TrendingUp,
      label: "Current APY",
      value: `${apyFromBps(apyBps)}%`,
      color: "text-green-400",
    },
    {
      icon: BarChart3,
      label: "Total Value Locked",
      value: tvl ? `${formatCompact(tvl)} MEGA` : "0 MEGA",
      color: "text-primary",
    },
    {
      icon: Wallet,
      label: "Total Stakers",
      value: stakers ? Number(stakers).toLocaleString() : "0",
      color: "text-accent",
    },
    {
      icon: Coins,
      label: "Rewards Distributed",
      value: rewards ? `${formatCompact(rewards)} MEGA` : "0 MEGA",
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={i}
          className="rounded-xl border border-white/5 bg-card-gradient p-5"
        >
          <div className="mb-2 flex items-center gap-2">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Staking Panel ───────────────────────────────────────────

type Tab = "stake" | "unstake";

function StakingPanel() {
  const [tab, setTab] = useState<Tab>("stake");
  const [amount, setAmount] = useState("");

  const { address } = useAccount();
  const { data: balance } = useTokenBalance();
  const { data: allowance } = useTokenAllowance();
  const { data: userInfo } = useUserInfo();

  const { approve, isPending: isApproving, isSuccess: approveSuccess } = useApproveToken();
  const { stake, isPending: isStaking, isConfirming: stakeConfirming, isSuccess: stakeSuccess } = useStake();
  const { unstake, isPending: isUnstaking, isConfirming: unstakeConfirming, isSuccess: unstakeSuccess } = useUnstake();

  const needsApproval =
    tab === "stake" &&
    amount &&
    allowance !== undefined &&
    parseEther(amount || "0") > (allowance as bigint);

  const isLoading = isApproving || isStaking || isUnstaking || stakeConfirming || unstakeConfirming;

  // Toasts on success
  useEffect(() => {
    if (approveSuccess) toast.success("Approval successful!");
  }, [approveSuccess]);

  useEffect(() => {
    if (stakeSuccess) {
      toast.success("Stake successful!");
      setAmount("");
    }
  }, [stakeSuccess]);

  useEffect(() => {
    if (unstakeSuccess) {
      toast.success("Unstake successful!");
      setAmount("");
    }
  }, [unstakeSuccess]);

  const handleMax = () => {
    if (tab === "stake" && balance) {
      setAmount(formatToken(balance as bigint, 4));
    } else if (tab === "unstake" && userInfo) {
      const [staked] = userInfo as readonly bigint[];
      setAmount(formatToken(staked, 4));
    }
  };

  const handleAction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (needsApproval) {
      approve(amount);
    } else if (tab === "stake") {
      stake(amount);
    } else {
      unstake(amount);
    }
  };

  const buttonLabel = () => {
    if (isLoading) return "Processing...";
    if (needsApproval) return "Approve MEGA";
    return tab === "stake" ? "Stake MEGA" : "Unstake MEGA";
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={0}
      className="rounded-2xl border border-white/5 bg-card-gradient p-6"
    >
      {/* Tabs */}
      <div className="mb-6 flex rounded-xl bg-surface p-1">
        {(["stake", "unstake"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setAmount("");
            }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
              tab === t
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "stake" ? (
              <span className="flex items-center justify-center gap-2">
                <ArrowDownToLine className="h-4 w-4" />
                Stake
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ArrowUpFromLine className="h-4 w-4" />
                Unstake
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="mb-2 rounded-xl border border-white/10 bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Amount</span>
          <button
            onClick={handleMax}
            className="text-xs font-medium text-primary hover:text-primary-400"
          >
            MAX
          </button>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/50"
          min="0"
          step="any"
        />
        <div className="mt-1 text-xs text-muted-foreground">
          {tab === "stake"
            ? `Balance: ${formatToken(balance as bigint)} MEGA`
            : `Staked: ${formatToken((userInfo as readonly bigint[] | undefined)?.[0])} MEGA`}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleAction}
        disabled={isLoading || !amount || parseFloat(amount) <= 0}
        className={cn(
          "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
          isLoading || !amount || parseFloat(amount) <= 0
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
        )}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {buttonLabel()}
      </button>
    </motion.div>
  );
}

// ─── User Info Card ──────────────────────────────────────────

function UserInfoCard() {
  const { address } = useAccount();
  const { data: userInfo } = useUserInfo();
  const { data: pending } = usePendingRewards();
  const { data: balance } = useTokenBalance();

  const { claim, isPending: isClaiming, isConfirming: claimConfirming, isSuccess: claimSuccess } =
    useClaimRewards();
  const { emergencyWithdraw, isPending: isEmerging, isConfirming: emergConfirming, isSuccess: emergSuccess } =
    useEmergencyWithdraw();

  useEffect(() => {
    if (claimSuccess) toast.success("Rewards claimed!");
  }, [claimSuccess]);

  useEffect(() => {
    if (emergSuccess) toast.success("Emergency withdraw complete!");
  }, [emergSuccess]);

  const info = userInfo as readonly bigint[] | undefined;
  const staked = info?.[0] ?? 0n;
  const lastStake = info?.[2] ?? 0n;
  const totalClaimed = info?.[3] ?? 0n;

  const claimDisabled = isClaiming || claimConfirming || !pending || pending === 0n;
  const emergDisabled = isEmerging || emergConfirming || staked === 0n;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={1}
      className="space-y-4"
    >
      {/* Balances */}
      <div className="rounded-2xl border border-white/5 bg-card-gradient p-6">
        <h3 className="mb-4 text-lg font-semibold">Your Position</h3>
        <div className="space-y-4">
          <InfoRow label="Wallet Balance" value={`${formatToken(balance as bigint)} MEGA`} />
          <InfoRow label="Staked Balance" value={`${formatToken(staked)} MEGA`} highlight />
          <InfoRow label="Pending Rewards" value={`${formatToken(pending as bigint)} MEGA`} highlight />
          <InfoRow label="Total Claimed" value={`${formatToken(totalClaimed)} MEGA`} />
          <InfoRow label="Last Activity" value={formatTimestamp(lastStake)} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/5 bg-card-gradient p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => claim()}
            disabled={claimDisabled}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
              claimDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/20"
            )}
          >
            {(isClaiming || claimConfirming) && <Loader2 className="h-4 w-4 animate-spin" />}
            <Gift className="h-4 w-4" />
            Claim Rewards
          </button>

          <button
            onClick={() => {
              if (confirm("Emergency withdraw forfeits all pending rewards. Continue?")) {
                emergencyWithdraw();
              }
            }}
            disabled={emergDisabled}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
              emergDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            )}
          >
            {(isEmerging || emergConfirming) && <Loader2 className="h-4 w-4 animate-spin" />}
            <AlertTriangle className="h-4 w-4" />
            Emergency Withdraw
          </button>
        </div>
      </div>

      {/* Connected Address */}
      <div className="rounded-2xl border border-white/5 bg-card-gradient p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Connected</span>
          <span className="font-mono text-xs text-foreground">
            {truncateAddress(address)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium", highlight && "text-primary")}>
        {value}
      </span>
    </div>
  );
}
