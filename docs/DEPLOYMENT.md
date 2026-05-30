# Deployment Guide

Complete step-by-step guide for deploying Megicula Stake to OPN Testnet.

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- A wallet with OPN Testnet tokens (for gas)
- Etherscan API key (optional, for verification)

---

## Step 1: Install Dependencies

```bash
# Root (Hardhat + contracts)
cd megicula-stake
npm install

# Frontend
cd frontend
npm install
cd ..
```

---

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PRIVATE_KEY=your_wallet_private_key_here
OPN_TESTNET_RPC=https://testnet-rpc.iopn.tech
ETHERSCAN_API_KEY=your_etherscan_api_key_here
NEXT_PUBLIC_CHAIN_ID=984
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.iopn.tech
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Security:** Never commit `.env` to version control.

---

## Step 3: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 17 Solidity files successfully (evm target: cancun).
```

---

## Step 4: Run Tests

```bash
npm run test
```

Expected output:
```
77 passing (3s)
```

---

## Step 5: Deploy MegiculaToken

```bash
npm run deploy:token
```

Output:
```
  Contract Address : 0x...
  Transaction Hash : 0x...
  [OK] Saved MEGICULA_TOKEN_ADDRESS to frontend/config/contracts.ts
```

**Save the contract address.** It's auto-saved to `frontend/config/contracts.ts`.

---

## Step 6: Deploy MegiculaStaking

```bash
npm run deploy:staking
```

Output:
```
  Contract Address : 0x...
  Transaction Hash : 0x...
  [OK] Saved MEGICULA_STAKING_ADDRESS to frontend/config/contracts.ts
```

---

## Step 7: Fund Reward Pool

The staking contract needs MEGA tokens in its reward pool to pay claims.

```bash
FUND_REWARDS=10000000 npm run deploy:staking
```

This approves and deposits 10,000,000 MEGA into the reward pool.

**Or fund manually:**
1. Approve the staking contract to spend your MEGA
2. Call `fundRewards(amount)` on the staking contract

---

## Step 8: Verify Contracts (Optional)

```bash
# Verify token
npx hardhat verify --network opnTestnet <TOKEN_ADDRESS>

# Verify staking
npx hardhat verify --network opnTestnet <STAKING_ADDRESS> "<TOKEN_ADDRESS>" 1000
```

---

## Step 9: Configure Frontend

After deployment, `frontend/config/contracts.ts` is auto-populated:

```typescript
export const CONTRACTS = {
  MEGICULA_TOKEN_ADDRESS: "0x...",
  MEGICULA_STAKING_ADDRESS: "0x...",
} as const;
```

Also update `frontend/lib/wagmi.ts` if using a custom WalletConnect project ID.

---

## Step 10: Build Frontend

```bash
cd frontend
npm run build
```

---

## Step 11: Deploy Frontend

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Set root directory to `frontend`
5. Add environment variables:
   - `NEXT_PUBLIC_CHAIN_ID=984`
   - `NEXT_PUBLIC_RPC_URL=https://testnet-rpc.iopn.tech`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...`
6. Deploy

### Option B: Static Export

```bash
cd frontend
# Add to next.config.ts: output: 'export'
npm run build
# Upload out/ folder to any static host
```

---

## Step 12: Deploy GitHub Pages Landing

1. Create a `gh-pages` branch
2. Copy `landing-page/` contents to the branch root
3. Enable GitHub Pages in repo settings (Source: gh-pages branch)
4. Update `CONTRACTS` in `landing-page/script.js` with real addresses

---

## Step 13: Update Landing Page Addresses

Edit `landing-page/script.js`:

```javascript
var CONTRACTS = {
  token: "0xYOUR_TOKEN_ADDRESS",
  staking: "0xYOUR_STAKING_ADDRESS",
};
```

---

## Verification Checklist

- [ ] Contracts compiled without errors
- [ ] All 77 tests pass
- [ ] Token deployed and verified on explorer
- [ ] Staking contract deployed and verified
- [ ] Reward pool funded
- [ ] Frontend config updated with contract addresses
- [ ] Frontend builds without errors
- [ ] Frontend deployed and accessible
- [ ] Wallet connects on OPN Testnet (Chain ID 984)
- [ ] Can stake tokens
- [ ] Can see pending rewards
- [ ] Can claim rewards
- [ ] Can unstake tokens
- [ ] GitHub Pages landing page live
- [ ] Landing page shows correct contract addresses

---

## Troubleshooting

### "Insufficient funds for gas"
Get OPN testnet tokens from the IOPn faucet or request from the community.

### "Cannot find module 'dotenv'"
Run `npm install dotenv` in the project root.

### "Invalid EVM version"
The `pectra` EVM version is not yet available in solc 0.8.30. Using `cancun` (latest stable). Update `hardhat.config.ts` when pectra support lands.

### Frontend shows "0x000...000" addresses
Contracts haven't been deployed yet, or `frontend/config/contracts.ts` wasn't updated. Run the deployment scripts.

### Wallet won't connect
Ensure your wallet is configured for OPN Testnet:
- Chain ID: 984
- RPC: https://testnet-rpc.iopn.tech
- Currency: OPN
