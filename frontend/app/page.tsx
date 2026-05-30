"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  TrendingUp,
  Globe,
  Code2,
  Wallet,
  Coins,
  Gift,
  Clock,
  ChevronRight,
  Github,
  ArrowRight,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Header } from "@/components/header";

// ─── Animation variants ──────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// ─── Data ────────────────────────────────────────────────────

const features = [
  {
    icon: Shield,
    title: "Secure Smart Contracts",
    desc: "Audited, open-source contracts with reentrancy guards, pausability, and SafeERC20.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Rewards",
    desc: "Rewards accumulate continuously. Claim anytime with no lock-up period.",
  },
  {
    icon: Globe,
    title: "OPN Testnet Native",
    desc: "Built specifically for the IOPn ecosystem. Fast, low-cost transactions.",
  },
  {
    icon: Code2,
    title: "Open Source",
    desc: "Fully transparent. Inspect every line of code on GitHub.",
  },
];

const steps = [
  { icon: Wallet, title: "Connect Wallet", desc: "Link your MetaMask or any EVM wallet." },
  { icon: Coins, title: "Stake Tokens", desc: "Deposit MEGA tokens into the staking contract." },
  { icon: TrendingUp, title: "Earn Rewards", desc: "Watch your rewards grow in real time at 10% APY." },
  { icon: Gift, title: "Claim Anytime", desc: "Withdraw rewards whenever you want. No lock-ups." },
];

const faqs = [
  {
    q: "What is Megicula Stake?",
    a: "Megicula Stake is a decentralized staking protocol built on OPN Testnet. Users stake MEGA tokens and earn continuous rewards at a configurable APY.",
  },
  {
    q: "How are rewards calculated?",
    a: "Rewards follow a continuous linear formula: reward = stakedAmount x APY x duration / 365 days. Default APY is 10%.",
  },
  {
    q: "Is there a lock-up period?",
    a: "No. You can unstake or claim rewards at any time. There is no minimum staking duration.",
  },
  {
    q: "What is MEGA?",
    a: "MEGA (Megicula Token) is the ERC20 governance and staking token for the protocol. Total supply: 100,000,000.",
  },
  {
    q: "Is the code audited?",
    a: "The contracts are open-source and use OpenZeppelin battle-tested libraries. Community audits are welcome.",
  },
];

// ─── Page Component ──────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Glow background */}
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
            >
              <Zap className="h-3 w-3" />
              Live on OPN Testnet
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Stake Assets on{" "}
              <span className="text-gradient">OPN Chain</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground"
            >
              Megicula Stake is a decentralized staking protocol built on OPN
              Testnet allowing users to earn passive rewards securely.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/stake"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-white/10"
              >
                <Github className="h-4 w-4" />
                View GitHub
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mb-4 text-3xl font-bold sm:text-4xl"
            >
              Why Megicula Stake?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-muted-foreground"
            >
              Built with security, transparency, and user experience in mind.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-white/5 bg-card-gradient p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-surface-card/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mb-4 text-3xl font-bold sm:text-4xl"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-muted-foreground"
            >
              Start earning in four simple steps.
            </motion.p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
                  <s.icon className="h-7 w-7" />
                </div>
                <span className="mb-2 text-xs font-bold text-primary">
                  Step {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="absolute -right-4 top-8 hidden h-5 w-5 text-primary/30 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mb-4 text-3xl font-bold sm:text-4xl"
            >
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.details
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group rounded-xl border border-white/5 bg-card-gradient"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-semibold">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {f.q}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="border-t border-white/5 px-5 pb-5 pt-3 text-sm text-muted-foreground">
                  {f.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-surface-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-gradient">Megicula Stake</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure. Stake. Earn on OPN Chain.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://testnet.opnscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── Stats (live from contract) ────────────────────────────────

import { useTotalStaked, useTotalStakers, useTotalRewardsDistributed } from "@/lib/hooks";
import { formatCompact } from "@/lib/utils";

function StatsSection() {
  const { data: tvl } = useTotalStaked();
  const { data: stakers } = useTotalStakers();
  const { data: rewards } = useTotalRewardsDistributed();

  const stats = [
    {
      label: "Total Value Locked",
      value: tvl ? `${formatCompact(tvl)} MEGA` : "0 MEGA",
      icon: TrendingUp,
    },
    {
      label: "Total Stakers",
      value: stakers ? Number(stakers).toLocaleString() : "0",
      icon: Wallet,
    },
    {
      label: "Rewards Distributed",
      value: rewards ? `${formatCompact(rewards)} MEGA` : "0 MEGA",
      icon: Gift,
    },
  ];

  return (
    <section className="border-y border-white/5 bg-surface-card/50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="mb-4 text-3xl font-bold sm:text-4xl"
          >
            Protocol Statistics
          </motion.h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="flex flex-col items-center rounded-2xl border border-white/5 bg-card-gradient p-8 text-center"
            >
              <s.icon className="mb-3 h-8 w-8 text-primary" />
              <span className="mb-1 text-3xl font-bold text-gradient">
                {s.value}
              </span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
