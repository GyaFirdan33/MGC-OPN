# Megicula Stake

> **Secure. Stake. Earn on OPN Chain.**

A decentralized staking protocol built on OPN Testnet (IOPn) allowing users to stake MEGA tokens and earn continuous passive rewards.

---

## Features

- **Stake & Unstake** — Deposit and withdraw MEGA tokens at any time
- **Claim Rewards** — Continuous 10% APY reward accrual, claimable anytime
- **Emergency Withdraw** — Exit instantly, forfeiting only pending rewards
- **Real-Time Dashboard** — Live stats: TVL, stakers, rewards, APY
- **Wallet Connect** — RainbowKit + Wagmi (MetaMask, WalletConnect, etc.)
- **Pause System** — Owner can pause staking in emergencies; exits always work
- **Open Source** — Full codebase on GitHub, verified on explorer

---

## Architecture

```
megicula-stake/
├── contracts/                 # Solidity 0.8.30
│   ├── MegiculaToken.sol      # ERC20 (MEGA) — 100M supply
│   └── MegiculaStaking.sol    # Staking contract — stake/unstake/claim/fund
│
├── test/                      # Hardhat tests (77 tests)
│   ├── MegiculaToken.test.ts
│   └── MegiculaStaking.test.ts
│
├── scripts/                   # Deployment
│   ├── deploy-token.ts
│   └── deploy-staking.ts
│
├── frontend/                  # Next.js 15 + Tailwind + ShadCN
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── stake/page.tsx     # Staking dashboard
│   │   └── docs/page.tsx      # Documentation
│   ├── components/            # Header, Providers
│   ├── config/                # ABIs, contract addresses
│   └── lib/                   # Wagmi config, hooks, utils
│
├── landing-page/              # GitHub Pages static site
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── docs/                      # Project documentation
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## Smart Contracts

### MegiculaToken (MEGA)

| Property | Value |
|----------|-------|
| Name | Megicula Token |
| Symbol | MEGA |
| Decimals | 18 |
| Total Supply | 100,000,000 MEGA |
| Standard | ERC20 + Burnable |
| Solidity | 0.8.30 |

### MegiculaStaking

| Property | Value |
|----------|-------|
| Default APY | 10% (1000 bps) |
| Reward Model | Continuous linear |
| Formula | `reward = staked × apyBps × duration / (365 days × 10,000)` |
| Security | ReentrancyGuard, Pausable, Ownable, SafeERC20 |

**Functions:**
- `stake(amount)` — Stake MEGA tokens
- `unstake(amount)` — Withdraw staked tokens
- `claimRewards()` — Claim all pending rewards
- `emergencyWithdraw()` — Exit immediately, forfeit rewards
- `getPendingRewards(addr)` — View unclaimed rewards
- `getUserInfo(addr)` — View full staking position

**Admin:**
- `setAPY(bps)` — Update APY (max 100%)
- `fundRewards(amount)` — Deposit to reward pool
- `pause()` / `unpause()` — Emergency controls

---

## Network Configuration

| Key | Value |
|-----|-------|
| Network | OPN Testnet |
| Chain ID | 984 |
| RPC | `https://testnet-rpc.iopn.tech` |
| Explorer | `https://testnet.opnscan.io` |
| Currency | OPN |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- A wallet with OPN Testnet tokens

### Install

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/megicula-stake.git
cd megicula-stake

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment

```bash
cp .env.example .env
# Edit .env with your private key and RPC URL
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy

```bash
# Deploy token
npm run deploy:token

# Deploy staking contract
npm run deploy:staking

# Fund reward pool (10M MEGA)
FUND_REWARDS=10000000 npm run deploy:staking
```

### Frontend

```bash
cd frontend
npm run dev        # Development
npm run build      # Production build
```

---

## Testing

77 tests covering:

- Token deployment, transfers, approvals, burning
- Staking: stake, unstake, multi-user, events
- Rewards: 1-year accrual, 30-day proportional, auto-claim
- Emergency withdraw: forfeit logic, state cleanup
- Pause system: stake blocked, exit always open
- Admin: APY updates, fund pool, ownership guards
- Edge cases: empty pool, claim-then-withdraw cycle

```bash
npm run test
# 77 passing (3s)
```

---

## Deployment Guide

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the complete step-by-step deployment guide.

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical architecture.

---

## Testing

See [docs/TESTING.md](docs/TESTING.md) for the full testing guide.

---

## IOPn Ecosystem Submission

See [docs/SUBMISSION_GUIDE.md](docs/SUBMISSION_GUIDE.md) for the submission checklist.

---

## Roadmap

### Phase 1 — Testnet Launch ✅
- Deploy MEGA token contract
- Deploy staking contract
- Launch frontend on OPN Testnet
- Open-source on GitHub
- GitHub Pages landing page

### Phase 2 — Enhanced Features
- Multiple staking pools
- Tiered APY system
- NFT staking integration
- Referral rewards

### Phase 3 — Mainnet & Governance
- Mainnet deployment
- DAO governance for APY votes
- Multi-chain expansion
- Security audit by firm

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.30, OpenZeppelin 5.x |
| Framework | Hardhat |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | TailwindCSS, Framer Motion |
| Web3 | Wagmi, Viem, RainbowKit |
| Testing | Chai, Hardhat Network Helpers |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## Contact

- **GitHub**: [github.com](https://github.com)
- **Explorer**: [testnet.opnscan.io](https://testnet.opnscan.io)
- **RPC**: [testnet-rpc.iopn.tech](https://testnet-rpc.iopn.tech)

# MGC-OPN
Dapp Test on IOPN Chain
2aa57b4780a27e9e1026218a1eec55a8eaf5c9b5
