"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Shield,
  Code2,
  Zap,
  FileText,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function DocsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible">
          <motion.div variants={fadeUp} custom={0} className="mb-12">
            <h1 className="mb-3 text-4xl font-bold">
              <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Megicula Stake.
            </p>
          </motion.div>

          {/* Overview */}
          <motion.section
            variants={fadeUp}
            custom={1}
            className="mb-10 rounded-2xl border border-white/5 bg-card-gradient p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Overview</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Megicula Stake</strong> is
                a decentralized staking protocol deployed on the{" "}
                <strong className="text-foreground">OPN Testnet</strong> (Chain
                ID: 984). Users stake MEGA tokens and earn continuous rewards at
                a configurable APY.
              </p>
              <p>
                The protocol consists of two smart contracts: the{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 text-primary">
                  MegiculaToken
                </code>{" "}
                (ERC20) and the{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 text-primary">
                  MegiculaStaking
                </code>{" "}
                contract. Both are verified and open-source.
              </p>
            </div>
          </motion.section>

          {/* Smart Contracts */}
          <motion.section
            variants={fadeUp}
            custom={2}
            className="mb-10 rounded-2xl border border-white/5 bg-card-gradient p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Smart Contracts</h2>
            </div>

            <div className="space-y-6">
              <ContractDoc
                name="MegiculaToken"
                symbol="MEGA"
                supply="100,000,000"
                desc="Standard ERC20 token with burn capability. Owned by deployer. Full supply minted at deployment."
              />
              <ContractDoc
                name="MegiculaStaking"
                symbol="MEGA"
                supply="N/A"
                desc="Core staking contract supporting stake, unstake, claim, and emergency withdraw. Protected by ReentrancyGuard, Pausable, and Ownable."
              />
            </div>
          </motion.section>

          {/* Reward Formula */}
          <motion.section
            variants={fadeUp}
            custom={3}
            className="mb-10 rounded-2xl border border-white/5 bg-card-gradient p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Reward Formula</h2>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Rewards are calculated using a continuous linear model:</p>
              <div className="rounded-xl bg-surface p-4 font-mono text-xs">
                <p className="text-primary">
                  reward = stakedAmount x APY_bps x duration
                </p>
                <p className="text-primary">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / (365 days x
                  10,000)
                </p>
              </div>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong className="text-foreground">APY_bps:</strong> APY in
                  basis points (1000 = 10%)
                </li>
                <li>
                  <strong className="text-foreground">Duration:</strong> Time
                  elapsed since last stake/claim (seconds)
                </li>
                <li>
                  <strong className="text-foreground">Default APY:</strong> 10%
                  (1000 bps)
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Security */}
          <motion.section
            variants={fadeUp}
            custom={4}
            className="mb-10 rounded-2xl border border-white/5 bg-card-gradient p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Security</h2>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <SecurityItem
                title="ReentrancyGuard"
                desc="All external state-changing functions are protected against reentrancy attacks."
              />
              <SecurityItem
                title="Pausable"
                desc="Owner can pause staking and claiming in emergencies. Unstake and emergency withdraw are always available."
              />
              <SecurityItem
                title="SafeERC20"
                desc="All token transfers use OpenZeppelin SafeERC20 to handle non-standard ERC20 responses."
              />
              <SecurityItem
                title="Ownable"
                desc="Admin functions restricted to contract owner. Uses OpenZeppelin Ownable with constructor ownership."
              />
              <SecurityItem
                title="Custom Errors"
                desc="Gas-efficient custom error types instead of string reverts."
              />
            </ul>
          </motion.section>

          {/* Contract Addresses */}
          <motion.section
            variants={fadeUp}
            custom={5}
            className="mb-10 rounded-2xl border border-white/5 bg-card-gradient p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Contract Addresses</h2>
            </div>
            <div className="space-y-3 text-sm">
              <AddressRow
                label="MEGA Token"
                address="See frontend/config/contracts.ts after deployment"
              />
              <AddressRow
                label="Staking Contract"
                address="See frontend/config/contracts.ts after deployment"
              />
            </div>
          </motion.section>

          {/* Links */}
          <motion.section
            variants={fadeUp}
            custom={6}
            className="mb-10 rounded-2xl border border-white/5 bg-card-gradient p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Useful Links</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <LinkCard
                title="OPN Testnet Explorer"
                href="https://testnet.opnscan.io"
              />
              <LinkCard
                title="OPN RPC Endpoint"
                href="https://testnet-rpc.iopn.tech"
              />
              <LinkCard title="GitHub Repository" href="https://github.com" />
              <LinkCard
                title="OpenZeppelin Docs"
                href="https://docs.openzeppelin.com"
              />
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            custom={7}
            className="text-center"
          >
            <Link
              href="/stake"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
            >
              Start Staking
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Subcomponents ───────────────────────────────────────────

function ContractDoc({
  name,
  symbol,
  supply,
  desc,
}: {
  name: string;
  symbol: string;
  supply: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface p-5">
      <h3 className="mb-1 font-semibold">{name}</h3>
      <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
        <span>Symbol: {symbol}</span>
        <span>Supply: {supply}</span>
      </div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function SecurityItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li>
      <strong className="text-foreground">{title}:</strong> {desc}
    </li>
  );
}

function AddressRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground">{address}</span>
    </div>
  );
}

function LinkCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface p-4 text-sm transition-all hover:border-primary/20 hover:bg-surface-elevated"
    >
      <ExternalLink className="h-4 w-4 text-primary" />
      {title}
    </a>
  );
}
