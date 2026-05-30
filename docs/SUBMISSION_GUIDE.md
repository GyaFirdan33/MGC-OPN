# IOPn Ecosystem Submission Guide

Step-by-step guide for submitting Megicula Stake as an IOPn ecosystem contribution.

---

## Submission Checklist

### 1. Smart Contracts

- [ ] MegiculaToken deployed on OPN Testnet
- [ ] MegiculaStaking deployed on OPN Testnet
- [ ] Both contracts verified on OPN Scan
- [ ] Reward pool funded
- [ ] All 77 tests passing

### 2. Frontend

- [ ] Frontend deployed and accessible
- [ ] Wallet connects on OPN Testnet (Chain ID 984)
- [ ] Staking flow works end-to-end
- [ ] Real-time stats display correctly
- [ ] Mobile responsive

### 3. Documentation

- [ ] README.md complete with all sections
- [ ] docs/DEPLOYMENT.md — full deployment guide
- [ ] docs/ARCHITECTURE.md — technical architecture
- [ ] docs/TESTING.md — test documentation
- [ ] docs/SUBMISSION_GUIDE.md — this file

### 4. Open Source

- [ ] GitHub repository public
- [ ] MIT License included
- [ ] All source code committed
- [ ] No secrets in code (.env gitignored)
- [ ] Clean commit history

### 5. GitHub Pages

- [ ] Landing page deployed
- [ ] Contract addresses displayed
- [ ] OPN Testnet links working
- [ ] Screenshots added (optional)

---

## Proof Submission Template

Use this template when submitting to the IOPn ecosystem:

```
Project: Megicula Stake
Type: DeFi Staking Protocol
Network: OPN Testnet (Chain ID 984)

Contract Addresses:
- MEGA Token: <address>
- Staking: <address>

Links:
- Frontend: <url>
- GitHub: <url>
- GitHub Pages: <url>
- Explorer (Token): https://testnet.opnscan.io/address/<token>
- Explorer (Staking): https://testnet.opnscan.io/address/<staking>

Features:
- ERC20 staking with continuous rewards
- 10% APY (configurable by admin)
- Emergency withdraw (no lock-ups)
- Pause system for emergencies
- Fully open-source

Tech Stack:
- Solidity 0.8.30, OpenZeppelin 5.x
- Hardhat, 77 tests
- Next.js 15, TailwindCSS, Framer Motion
- Wagmi, Viem, RainbowKit

Test Results: 77 passing, 0 failing
```

---

## Contract Verification Steps

### Verify MegiculaToken

```bash
npx hardhat verify --network opnTestnet <TOKEN_ADDRESS>
```

### Verify MegiculaStaking

```bash
npx hardhat verify --network opnTestnet <STAKING_ADDRESS> "<TOKEN_ADDRESS>" 1000
```

Where:
- `<STAKING_ADDRESS>` — deployed staking contract address
- `<TOKEN_ADDRESS>` — deployed MEGA token address
- `1000` — initial APY in basis points

### Verification on OPN Scan

1. Go to https://testnet.opnscan.io
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Select compiler: Solidity 0.8.30
6. Select EVM: cancun
7. Paste flattened source or use Hardhat verification

---

## GitHub Pages Deployment

### Option 1: gh-pages Branch

```bash
# Install gh-pages
npm install -g gh-pages

# Create and switch to gh-pages branch
git checkout -b gh-pages

# Copy landing page to root
cp -r landing-page/* .

# Commit and push
git add .
git commit -m "Deploy landing page"
git push origin gh-pages

# Enable in GitHub Settings → Pages → Source: gh-pages branch
```

### Option 2: Docs Folder

1. Go to GitHub repo Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: /landing-page
4. Save

---

## Adding Screenshots

1. Take screenshots of:
   - Landing page hero
   - Staking dashboard (connected)
   - Mobile view
   - Transaction success toast

2. Add to `landing-page/` folder

3. Update `index.html` screenshot placeholders:
   ```html
   <div class="screenshot-placeholder">
     <img src="screenshot-dashboard.png" alt="Staking Dashboard" />
   </div>
   ```

---

## Common Submission Issues

### "Contract not verified"
Run the verification commands above. If automatic verification fails, use the manual form on OPN Scan.

### "Frontend shows zero addresses"
Ensure `frontend/config/contracts.ts` has real addresses after deployment.

### "Wallet won't connect"
Users need to manually add OPN Testnet to their wallet:
- Network Name: OPN Testnet
- Chain ID: 984
- RPC URL: https://testnet-rpc.iopn.tech
- Currency Symbol: OPN

### "Tests failing"
Run `npm run test` from the project root (not frontend/). Ensure dependencies are installed with `npm install`.

---

## Post-Submission

After successful submission:

1. Monitor contract activity on OPN Scan
2. Respond to community feedback
3. Plan Phase 2 features
4. Consider security audit for mainnet
5. Engage with IOPn community on Discord/Twitter
