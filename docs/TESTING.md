# Testing Guide

Complete testing documentation for Megicula Stake.

---

## Quick Start

```bash
# Run all tests
npm run test

# Run with gas reporting
REPORT_GAS=true npm run test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/MegiculaToken.test.ts
npx hardhat test test/MegiculaStaking.test.ts
```

---

## Test Suite Overview

**Total: 77 tests, 0 failures**

| Suite | Tests | Coverage |
|-------|-------|----------|
| MegiculaToken | 12 | Deployment, Transfers, Approvals, Burning |
| MegiculaStaking | 65 | All contract functions, admin, edge cases |

---

## MegiculaToken Tests (12)

### Deployment (5)
- ✅ Correct token name
- ✅ Correct token symbol
- ✅ 100M MEGA minted to deployer
- ✅ Total supply is 100M
- ✅ Deployer is owner

### Transfers (3)
- ✅ Transfer between accounts
- ✅ Emits Transfer event
- ✅ Reverts on insufficient balance

### Approvals (3)
- ✅ Approve spender
- ✅ TransferFrom after approval
- ✅ Emits Approval event

### Burning (3)
- ✅ Holder can burn own tokens
- ✅ Balance reduces after burn
- ✅ burnFrom with approval

---

## MegiculaStaking Tests (65)

### Deployment (5)
- ✅ Correct staking token
- ✅ Correct APY (1000 bps)
- ✅ Deployer is owner
- ✅ Zero initial totalStaked
- ✅ Funded reward pool

### Stake (9)
- ✅ Stake tokens successfully
- ✅ Updates totalStaked
- ✅ Increments totalStakers
- ✅ Doesn't double-count same staker
- ✅ Emits Stake event
- ✅ Reverts on zero amount
- ✅ Transfers tokens to contract
- ✅ Reverts without approval
- ✅ Multiple stakes from same user

### Unstake (8)
- ✅ Unstake tokens successfully
- ✅ Updates totalStaked
- ✅ Decrements totalStakers on full unstake
- ✅ Emits Unstake event
- ✅ Reverts on zero amount
- ✅ Reverts when unstaking more than staked
- ✅ Returns tokens to user (including auto-claimed rewards)
- ✅ Reverts when user has no stake

### Rewards (11)
- ✅ Accumulates rewards over 1 year
- ✅ Proportional rewards for 30 days
- ✅ Claims rewards successfully
- ✅ Emits RewardClaimed event
- ✅ Updates totalRewardsClaimed
- ✅ Updates totalRewardsDistributed
- ✅ Reduces rewardPoolBalance after claim
- ✅ Reverts claim when no pending rewards
- ✅ Independent rewards for multiple users
- ✅ Auto-claims on restake
- ✅ Auto-claims on unstake

### Emergency Withdraw (7)
- ✅ Withdraws all staked tokens
- ✅ Zeros out user state
- ✅ Decrements totalStakers
- ✅ Updates totalStaked
- ✅ Emits EmergencyWithdraw event
- ✅ Does NOT distribute rewards
- ✅ Reverts when no stake

### Pause System (9)
- ✅ Owner can pause
- ✅ Owner can unpause
- ✅ Stake blocked when paused
- ✅ ClaimRewards blocked when paused
- ✅ Unstake allowed when paused
- ✅ Emergency withdraw allowed when paused
- ✅ Non-owner cannot pause
- ✅ Non-owner cannot unpause
- ✅ Staking works after unpause

### Admin — setAPY (6)
- ✅ Updates APY
- ✅ Emits APYUpdated event
- ✅ Reverts zero APY
- ✅ Reverts APY over 100%
- ✅ Allows exactly 100% APY
- ✅ Reverts by non-owner

### Admin — fundRewards (5)
- ✅ Adds to reward pool balance
- ✅ Emits RewardPoolFunded event
- ✅ Reverts on zero amount
- ✅ Reverts by non-owner
- ✅ Reverts without approval

### Edge Cases (3)
- ✅ Stake → claim → restake cycle
- ✅ Reverts claim when reward pool is empty
- ✅ Preserves totalRewardsClaimed after emergency withdraw

---

## Test Architecture

Tests use:
- `ethers.getSigners()` for test accounts
- `time.increase()` from Hardhat Network Helpers for time manipulation
- `closeTo()` for approximate reward comparisons (tolerance for block time variance)
- `revertedWithCustomError()` for custom error assertions
- `expect().to.emit()` for event verification

### Reward Math Verification

The 1-year staking test:
```
stake: 10,000 MEGA
APY: 10% (1000 bps)
duration: 365 days
expected: 10,000 × 10% = 1,000 MEGA
tolerance: ±1% (block time variance)
```

The 30-day test:
```
stake: 10,000 MEGA
APY: 10%
duration: 30 days
expected: 10,000 × 10% × 30/365 ≈ 82.19 MEGA
tolerance: ±2%
```

---

## Running Coverage

```bash
npm run coverage
```

This generates a coverage report in the `coverage/` directory.

---

## Gas Reporting

```bash
REPORT_GAS=true npm run test
```

This prints gas usage for each function call after the test results.
