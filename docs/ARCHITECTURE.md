# Architecture

Technical architecture of the Megicula Stake protocol.

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Landing     │  │  Stake      │  │  Docs           │ │
│  │  Page (/)    │  │  Dashboard  │  │  Page           │ │
│  │             │  │  (/stake)   │  │  (/docs)        │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────┘ │
│         │                │                               │
│  ┌──────┴────────────────┴──────────────────────────┐   │
│  │              Wagmi + RainbowKit                   │   │
│  │         (Wallet Connection Layer)                 │   │
│  └──────────────────────┬────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ JSON-RPC
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  OPN Testnet (Chain 984)                 │
│  ┌───────────────────┐  ┌─────────────────────────────┐ │
│  │  MegiculaToken    │  │  MegiculaStaking            │ │
│  │  (ERC20)          │◄─│  (Staking Contract)         │ │
│  │                   │  │                             │ │
│  │  - balanceOf()    │  │  - stake()                  │ │
│  │  - transfer()     │  │  - unstake()                │ │
│  │  - approve()      │  │  - claimRewards()           │ │
│  │  - burn()         │  │  - emergencyWithdraw()      │ │
│  │                   │  │  - fundRewards()            │ │
│  │  Supply: 100M     │  │  - setAPY()                 │ │
│  └───────────────────┘  │  - pause() / unpause()      │ │
│                         └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Smart Contract Architecture

### MegiculaToken.sol

**Inheritance chain:**
```
ERC20 ← MegiculaToken
ERC20Burnable ← MegiculaToken
Ownable ← MegiculaToken
```

**State:**
- Standard ERC20 mappings (balances, allowances)
- 100,000,000 MEGA minted to deployer in constructor

**Functions:**
- All standard ERC20 functions (transfer, approve, transferFrom)
- `burn(amount)` — any holder can burn their own tokens
- `burnFrom(account, amount)` — burn from approved allowance

### MegiculaStaking.sol

**Inheritance chain:**
```
ReentrancyGuard ← MegiculaStaking
Ownable ← MegiculaStaking
Pausable ← MegiculaStaking
```

**State variables:**
```solidity
IERC20 public immutable stakingToken;    // MEGA token address
uint256 public apyBps;                    // APY in basis points (1000 = 10%)
uint256 public totalStaked;              // Total tokens staked
uint256 public totalStakers;             // Unique staker count
uint256 public totalRewardsDistributed;  // Lifetime rewards paid
uint256 public rewardPoolBalance;        // Available reward pool

mapping(address => UserInfo) public userInfo;
```

**UserInfo struct:**
```solidity
struct UserInfo {
    uint256 amountStaked;         // Current staked balance
    uint256 rewardDebt;           // Already-claimed portion of current cycle
    uint256 lastStakeTime;        // Timestamp of last interaction
    uint256 totalRewardsClaimed;  // Lifetime rewards claimed
}
```

### Reward Calculation

```
pending = (stakedAmount × apyBps × duration) / (365 days × 10,000) - rewardDebt
```

Where:
- `stakedAmount` — user's current staked balance
- `apyBps` — APY in basis points
- `duration` — seconds since `lastStakeTime`
- `rewardDebt` — amount already claimed in current cycle

**Flow:**
1. User stakes → `lastStakeTime = now`, `rewardDebt = 0`
2. Time passes → `pending` grows linearly
3. User claims → tokens transferred, `rewardDebt = 0`, `lastStakeTime = now`
4. User restakes → auto-claim first, then update stake

### Security Model

| Protection | Mechanism |
|-----------|-----------|
| Reentrancy | `ReentrancyGuard` on all mutating externals |
| Pause | `Pausable` on `stake()` and `claimRewards()` |
| Token safety | `SafeERC20` for all transfers |
| Admin access | `Ownable` for `setAPY`, `fundRewards`, `pause` |
| Overflow | Solidity 0.8.30 built-in overflow checks |
| Zero amounts | Custom `ZeroAmount` error |
| Invalid APY | Capped at 10,000 bps (100%) |
| Reward pool | Balance checked before every claim |

---

## Frontend Architecture

### Tech Stack

```
Next.js 15 (App Router)
  ├── React 19
  ├── TypeScript
  ├── TailwindCSS
  ├── Framer Motion (animations)
  ├── Sonner (toasts)
  └── Web3 Layer
       ├── Wagmi 2.x (contract reads/writes)
       ├── Viem 2.x (Ethereum utilities)
       ├── RainbowKit 2.x (wallet UI)
       └── TanStack Query (caching)
```

### Page Structure

```
frontend/app/
├── layout.tsx          Root layout + Providers wrapper
├── page.tsx            Landing page (SSR-compatible)
├── stake/page.tsx      Staking dashboard (client-only)
└── docs/page.tsx       Documentation (client-only)
```

### Data Flow

```
Browser
  │
  ├── Wagmi Provider
  │    ├── useReadContract() → JSON-RPC → Contract view functions
  │    └── useWriteContract() → Wallet Sign → JSON-RPC → Contract mutations
  │
  ├── TanStack Query
  │    └── Auto-refetch on block changes (5s for balances)
  │
  └── React Components
       ├── StatsGrid (TVL, stakers, rewards)
       ├── StakingPanel (stake/unstake forms)
       └── UserInfoCard (position + quick actions)
```

### Hook Architecture

| Hook | Type | Refetch |
|------|------|---------|
| `useTokenBalance` | Read | 5s |
| `useTokenAllowance` | Read | On demand |
| `useStakingApy` | Read | 30s |
| `useTotalStaked` | Read | 5s |
| `useTotalStakers` | Read | 10s |
| `useTotalRewardsDistributed` | Read | 10s |
| `useUserInfo` | Read | 5s |
| `usePendingRewards` | Read | 3s |
| `useApproveToken` | Write | — |
| `useStake` | Write | — |
| `useUnstake` | Write | — |
| `useClaimRewards` | Write | — |
| `useEmergencyWithdraw` | Write | — |

---

## Network Architecture

```
User Wallet (MetaMask, etc.)
    │
    │  Chain ID: 984
    │  RPC: https://testnet-rpc.iopn.tech
    ▼
OPN Testnet (IOPn EVM)
    │
    ├── MegiculaToken contract
    └── MegiculaStaking contract
```

---

## Deployment Architecture

```
Developer Machine
    │
    ├── hardhat deploy-token.ts
    │    └── Writes to frontend/config/contracts.ts
    │
    ├── hardhat deploy-staking.ts
    │    └── Reads token address from frontend config
    │    └── Writes staking address to frontend config
    │
    └── frontend build + deploy
         └── Reads contract addresses from config
         └── Reads ABIs from config/abis.ts
```

---

## File Dependency Graph

```
hardhat.config.ts
  └── Reads .env (PRIVATE_KEY, RPC)

contracts/MegiculaToken.sol
  └── Imports @openzeppelin/contracts

contracts/MegiculaStaking.sol
  └── Imports @openzeppelin/contracts
  └── References MegiculaToken (via constructor arg)

scripts/deploy-token.ts
  └── Writes frontend/config/contracts.ts

scripts/deploy-staking.ts
  └── Reads frontend/config/contracts.ts
  └── Writes frontend/config/contracts.ts

frontend/lib/wagmi.ts
  └── Reads NEXT_PUBLIC_* env vars

frontend/config/contracts.ts
  └── Written by deployment scripts

frontend/config/abis.ts
  └── Hardcoded ABI (matches compiled artifacts)

frontend/lib/hooks.ts
  └── Reads frontend/config/contracts.ts
  └── Reads frontend/config/abis.ts

frontend/app/stake/page.tsx
  └── Uses frontend/lib/hooks.ts
  └── Uses frontend/lib/utils.ts
  └── Uses frontend/components/header.tsx
```
