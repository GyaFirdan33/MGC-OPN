import { expect } from "chai";
import { ethers } from "hardhat";
import { MegiculaToken, MegiculaStaking } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MegiculaStaking", function () {
  let token: MegiculaToken;
  let staking: MegiculaStaking;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseEther("100000000");
  const APY_BPS = 1000n; // 10 %
  const BPS_DENOM = 10_000n;
  const ONE_YEAR = 365 * 24 * 60 * 60; // seconds

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    // Deploy token
    const TokenFactory = await ethers.getContractFactory("MegiculaToken");
    token = await TokenFactory.deploy();

    // Deploy staking
    const StakingFactory = await ethers.getContractFactory("MegiculaStaking");
    staking = await StakingFactory.deploy(await token.getAddress(), APY_BPS);

    // Distribute tokens to test users
    await token.transfer(alice.address, ethers.parseEther("1000000"));
    await token.transfer(bob.address, ethers.parseEther("1000000"));

    // Fund reward pool: approve then fund
    const fundAmount = ethers.parseEther("10000000"); // 10 M for rewards
    await token.approve(await staking.getAddress(), fundAmount);
    await staking.fundRewards(fundAmount);
  });

  // ───────────────────────────────────────────────────────────────────
  //  Helpers
  // ───────────────────────────────────────────────────────────────────

  async function stakeAs(user: HardhatEthersSigner, amount: bigint) {
    await token.connect(user).approve(await staking.getAddress(), amount);
    return staking.connect(user).stake(amount);
  }

  // ───────────────────────────────────────────────────────────────────
  //  Deployment
  // ───────────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("should set the correct staking token", async function () {
      expect(await staking.stakingToken()).to.equal(await token.getAddress());
    });

    it("should set the correct APY", async function () {
      expect(await staking.apyBps()).to.equal(APY_BPS);
    });

    it("should set deployer as owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("should start with zero total staked", async function () {
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("should have funded reward pool", async function () {
      expect(await staking.rewardPoolBalance()).to.equal(ethers.parseEther("10000000"));
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Staking
  // ───────────────────────────────────────────────────────────────────

  describe("Stake", function () {
    it("should stake tokens successfully", async function () {
      const amount = ethers.parseEther("1000");
      await stakeAs(alice, amount);

      const info = await staking.getUserInfo(alice.address);
      expect(info.amountStaked).to.equal(amount);
    });

    it("should update totalStaked", async function () {
      const amount = ethers.parseEther("5000");
      await stakeAs(alice, amount);
      expect(await staking.totalStaked()).to.equal(amount);
    });

    it("should increment totalStakers", async function () {
      await stakeAs(alice, ethers.parseEther("1000"));
      expect(await staking.totalStakers()).to.equal(1);

      await stakeAs(bob, ethers.parseEther("2000"));
      expect(await staking.totalStakers()).to.equal(2);
    });

    it("should not double-count same staker", async function () {
      await stakeAs(alice, ethers.parseEther("1000"));
      await stakeAs(alice, ethers.parseEther("500"));
      expect(await staking.totalStakers()).to.equal(1);
    });

    it("should emit Stake event", async function () {
      const amount = ethers.parseEther("3000");
      await expect(stakeAs(alice, amount))
        .to.emit(staking, "Stake")
        .withArgs(alice.address, amount, (v: bigint) => v > 0);
    });

    it("should revert on zero amount", async function () {
      await expect(stakeAs(alice, 0n)).to.be.revertedWithCustomError(staking, "ZeroAmount");
    });

    it("should transfer tokens from user to contract", async function () {
      const amount = ethers.parseEther("2000");
      const balBefore = await token.balanceOf(alice.address);
      await stakeAs(alice, amount);
      expect(await token.balanceOf(alice.address)).to.equal(balBefore - amount);
    });

    it("should revert if user has not approved", async function () {
      const amount = ethers.parseEther("1000");
      await expect(staking.connect(alice).stake(amount)).to.be.reverted;
    });

    it("should allow multiple stakes from same user", async function () {
      await stakeAs(alice, ethers.parseEther("1000"));
      await stakeAs(alice, ethers.parseEther("2000"));

      const info = await staking.getUserInfo(alice.address);
      expect(info.amountStaked).to.equal(ethers.parseEther("3000"));
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Unstaking
  // ───────────────────────────────────────────────────────────────────

  describe("Unstake", function () {
    const stakeAmount = ethers.parseEther("10000");

    beforeEach(async function () {
      await stakeAs(alice, stakeAmount);
    });

    it("should unstake tokens successfully", async function () {
      const unstakeAmount = ethers.parseEther("5000");
      await staking.connect(alice).unstake(unstakeAmount);

      const info = await staking.getUserInfo(alice.address);
      expect(info.amountStaked).to.equal(stakeAmount - unstakeAmount);
    });

    it("should update totalStaked on unstake", async function () {
      const unstakeAmount = ethers.parseEther("3000");
      await staking.connect(alice).unstake(unstakeAmount);
      expect(await staking.totalStaked()).to.equal(stakeAmount - unstakeAmount);
    });

    it("should decrement totalStakers when fully unstaked", async function () {
      await staking.connect(alice).unstake(stakeAmount);
      expect(await staking.totalStakers()).to.equal(0);
    });

    it("should emit Unstake event", async function () {
      const amount = ethers.parseEther("2000");
      await expect(staking.connect(alice).unstake(amount))
        .to.emit(staking, "Unstake")
        .withArgs(alice.address, amount, (v: bigint) => v > 0);
    });

    it("should revert on zero amount", async function () {
      await expect(staking.connect(alice).unstake(0n)).to.be.revertedWithCustomError(
        staking,
        "ZeroAmount"
      );
    });

    it("should revert when unstaking more than staked", async function () {
      const tooMuch = stakeAmount + 1n;
      await expect(staking.connect(alice).unstake(tooMuch)).to.be.revertedWithCustomError(
        staking,
        "InsufficientStake"
      );
    });

    it("should return tokens to user on unstake", async function () {
      const balBefore = await token.balanceOf(alice.address);
      const unstakeAmount = ethers.parseEther("4000");
      await staking.connect(alice).unstake(unstakeAmount);
      // unstake auto-claims accrued rewards, so balance >= balBefore + unstakeAmount
      expect(await token.balanceOf(alice.address)).to.be.gte(balBefore + unstakeAmount);
    });

    it("should revert when user has no stake", async function () {
      await expect(staking.connect(bob).unstake(ethers.parseEther("1"))).to.be.revertedWithCustomError(
        staking,
        "InsufficientStake"
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Reward Generation & Claiming
  // ───────────────────────────────────────────────────────────────────

  describe("Rewards", function () {
    const stakeAmount = ethers.parseEther("10000");

    it("should accumulate rewards over time", async function () {
      await stakeAs(alice, stakeAmount);

      // Advance 1 year
      await time.increase(ONE_YEAR);

      const pending = await staking.getPendingRewards(alice.address);

      // Expected: 10000 × 10% = 1000 MEGA (approximately)
      const expected = (stakeAmount * APY_BPS) / BPS_DENOM;
      // Allow 1% tolerance for block time variance
      expect(pending).to.be.closeTo(expected, expected / 100n);
    });

    it("should accumulate proportional rewards for 30 days", async function () {
      await stakeAs(alice, stakeAmount);

      const thirtyDays = 30 * 24 * 60 * 60;
      await time.increase(thirtyDays);

      const pending = await staking.getPendingRewards(alice.address);
      // Expected: 10000 × 10% × 30/365 ≈ 82.19 MEGA
      const expected = (stakeAmount * APY_BPS * BigInt(thirtyDays)) / (BigInt(ONE_YEAR) * BPS_DENOM);

      expect(pending).to.be.closeTo(expected, expected / 50n); // 2% tolerance
    });

    it("should claim rewards successfully", async function () {
      await stakeAs(alice, stakeAmount);
      await time.increase(ONE_YEAR);

      const balBefore = await token.balanceOf(alice.address);
      await staking.connect(alice).claimRewards();
      const balAfter = await token.balanceOf(alice.address);

      expect(balAfter).to.be.gt(balBefore);
    });

    it("should emit RewardClaimed event", async function () {
      await stakeAs(alice, stakeAmount);
      await time.increase(ONE_YEAR);

      await expect(staking.connect(alice).claimRewards()).to.emit(staking, "RewardClaimed");
    });

    it("should update totalRewardsClaimed", async function () {
      await stakeAs(alice, stakeAmount);
      await time.increase(ONE_YEAR);

      await staking.connect(alice).claimRewards();
      const info = await staking.getUserInfo(alice.address);
      expect(info.totalRewardsClaimed).to.be.gt(0);
    });

    it("should update totalRewardsDistributed", async function () {
      await stakeAs(alice, stakeAmount);
      await time.increase(ONE_YEAR);

      await staking.connect(alice).claimRewards();
      expect(await staking.totalRewardsDistributed()).to.be.gt(0);
    });

    it("should reduce rewardPoolBalance after claim", async function () {
      const poolBefore = await staking.rewardPoolBalance();
      await stakeAs(alice, stakeAmount);
      await time.increase(ONE_YEAR);

      await staking.connect(alice).claimRewards();
      const poolAfter = await staking.rewardPoolBalance();
      expect(poolAfter).to.be.lt(poolBefore);
    });

    it("should revert claim when no pending rewards", async function () {
      await expect(staking.connect(alice).claimRewards()).to.be.revertedWithCustomError(
        staking,
        "ZeroAmount"
      );
    });

    it("should handle multiple users with independent rewards", async function () {
      await stakeAs(alice, ethers.parseEther("10000"));
      await stakeAs(bob, ethers.parseEther("20000"));
      await time.increase(ONE_YEAR);

      const alicePending = await staking.getPendingRewards(alice.address);
      const bobPending = await staking.getPendingRewards(bob.address);

      // Bob staked 2x so should have ~2x rewards
      expect(bobPending).to.be.closeTo(alicePending * 2n, alicePending / 50n);
    });

    it("should auto-claim pending rewards on restake", async function () {
      await stakeAs(alice, ethers.parseEther("5000"));
      await time.increase(180 * 24 * 60 * 60); // 180 days

      const balBefore = await token.balanceOf(alice.address);
      await stakeAs(alice, ethers.parseEther("5000")); // restake
      const balAfter = await token.balanceOf(alice.address);

      // Balance should have increased by reward (minus new stake)
      // balAfter = balBefore + reward - 5000
      // So balAfter + 5000 should be > balBefore (reward > 0)
      expect(balAfter + ethers.parseEther("5000")).to.be.gt(balBefore);
    });

    it("should auto-claim pending rewards on unstake", async function () {
      await stakeAs(alice, ethers.parseEther("10000"));
      await time.increase(365 * 24 * 60 * 60); // 1 year

      const balBefore = await token.balanceOf(alice.address);
      await staking.connect(alice).unstake(ethers.parseEther("10000"));
      const balAfter = await token.balanceOf(alice.address);

      // Should get back stake + rewards
      expect(balAfter).to.be.gt(balBefore + ethers.parseEther("10000") - 1n);
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Emergency Withdraw
  // ───────────────────────────────────────────────────────────────────

  describe("Emergency Withdraw", function () {
    const stakeAmount = ethers.parseEther("10000");

    beforeEach(async function () {
      await stakeAs(alice, stakeAmount);
    });

    it("should withdraw all staked tokens", async function () {
      const balBefore = await token.balanceOf(alice.address);
      await staking.connect(alice).emergencyWithdraw();
      expect(await token.balanceOf(alice.address)).to.equal(balBefore + stakeAmount);
    });

    it("should zero out user state", async function () {
      await staking.connect(alice).emergencyWithdraw();
      const info = await staking.getUserInfo(alice.address);
      expect(info.amountStaked).to.equal(0);
      expect(info.pendingRewards).to.equal(0);
    });

    it("should decrement totalStakers", async function () {
      await staking.connect(alice).emergencyWithdraw();
      expect(await staking.totalStakers()).to.equal(0);
    });

    it("should update totalStaked", async function () {
      await staking.connect(alice).emergencyWithdraw();
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("should emit EmergencyWithdraw event", async function () {
      await expect(staking.connect(alice).emergencyWithdraw())
        .to.emit(staking, "EmergencyWithdraw")
        .withArgs(alice.address, stakeAmount, (v: bigint) => v > 0);
    });

    it("should NOT distribute rewards", async function () {
      await time.increase(ONE_YEAR);
      const balBefore = await token.balanceOf(alice.address);
      await staking.connect(alice).emergencyWithdraw();
      const balAfter = await token.balanceOf(alice.address);

      // Should only get back staked amount, not rewards
      expect(balAfter).to.equal(balBefore + stakeAmount);
    });

    it("should revert when no stake", async function () {
      await expect(staking.connect(bob).emergencyWithdraw()).to.be.revertedWithCustomError(
        staking,
        "InsufficientStake"
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Pause System
  // ───────────────────────────────────────────────────────────────────

  describe("Pause System", function () {
    it("should pause by owner", async function () {
      await staking.pause();
      expect(await staking.paused()).to.be.true;
    });

    it("should unpause by owner", async function () {
      await staking.pause();
      await staking.unpause();
      expect(await staking.paused()).to.be.false;
    });

    it("should revert stake when paused", async function () {
      await staking.pause();
      await token.connect(alice).approve(await staking.getAddress(), ethers.parseEther("1000"));
      await expect(
        staking.connect(alice).stake(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(staking, "EnforcedPause");
    });

    it("should revert claimRewards when paused", async function () {
      await stakeAs(alice, ethers.parseEther("1000"));
      await time.increase(ONE_YEAR);
      await staking.pause();

      await expect(staking.connect(alice).claimRewards()).to.be.revertedWithCustomError(
        staking,
        "EnforcedPause"
      );
    });

    it("should allow unstake when paused", async function () {
      await stakeAs(alice, ethers.parseEther("1000"));
      await staking.pause();

      // unstake is NOT paused — users can always exit
      await expect(staking.connect(alice).unstake(ethers.parseEther("500"))).to.not.be.reverted;
    });

    it("should allow emergency withdraw when paused", async function () {
      await stakeAs(alice, ethers.parseEther("1000"));
      await staking.pause();

      await expect(staking.connect(alice).emergencyWithdraw()).to.not.be.reverted;
    });

    it("should revert pause by non-owner", async function () {
      await expect(staking.connect(alice).pause()).to.be.revertedWithCustomError(
        staking,
        "OwnableUnauthorizedAccount"
      );
    });

    it("should revert unpause by non-owner", async function () {
      await staking.pause();
      await expect(staking.connect(alice).unpause()).to.be.revertedWithCustomError(
        staking,
        "OwnableUnauthorizedAccount"
      );
    });

    it("should allow staking after unpause", async function () {
      await staking.pause();
      await staking.unpause();
      await expect(stakeAs(alice, ethers.parseEther("1000"))).to.not.be.reverted;
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Admin Functions
  // ───────────────────────────────────────────────────────────────────

  describe("Admin Functions", function () {
    describe("setAPY", function () {
      it("should update APY", async function () {
        await staking.setAPY(2000); // 20%
        expect(await staking.apyBps()).to.equal(2000);
      });

      it("should emit APYUpdated event", async function () {
        await expect(staking.setAPY(500))
          .to.emit(staking, "APYUpdated")
          .withArgs(1000, 500);
      });

      it("should revert zero APY", async function () {
        await expect(staking.setAPY(0)).to.be.revertedWithCustomError(staking, "InvalidAPY");
      });

      it("should revert APY over 100%", async function () {
        await expect(staking.setAPY(10001)).to.be.revertedWithCustomError(staking, "InvalidAPY");
      });

      it("should allow exactly 100% APY", async function () {
        await staking.setAPY(10000);
        expect(await staking.apyBps()).to.equal(10000);
      });

      it("should revert by non-owner", async function () {
        await expect(staking.connect(alice).setAPY(500)).to.be.revertedWithCustomError(
          staking,
          "OwnableUnauthorizedAccount"
        );
      });
    });

    describe("fundRewards", function () {
      it("should add to reward pool balance", async function () {
        const poolBefore = await staking.rewardPoolBalance();
        const extra = ethers.parseEther("1000");
        await token.approve(await staking.getAddress(), extra);
        await staking.fundRewards(extra);
        expect(await staking.rewardPoolBalance()).to.equal(poolBefore + extra);
      });

      it("should emit RewardPoolFunded event", async function () {
        const extra = ethers.parseEther("500");
        await token.approve(await staking.getAddress(), extra);
        await expect(staking.fundRewards(extra)).to.emit(staking, "RewardPoolFunded");
      });

      it("should revert on zero amount", async function () {
        await expect(staking.fundRewards(0)).to.be.revertedWithCustomError(staking, "ZeroAmount");
      });

      it("should revert by non-owner", async function () {
        const extra = ethers.parseEther("100");
        await token.connect(alice).approve(await staking.getAddress(), extra);
        await expect(staking.connect(alice).fundRewards(extra)).to.be.revertedWithCustomError(
          staking,
          "OwnableUnauthorizedAccount"
        );
      });

      it("should revert without approval", async function () {
        await expect(staking.fundRewards(ethers.parseEther("100"))).to.be.reverted;
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Edge Cases
  // ───────────────────────────────────────────────────────────────────

  describe("Edge Cases", function () {
    it("should handle stake, claim, restake cycle", async function () {
      // Stake
      await stakeAs(alice, ethers.parseEther("10000"));
      await time.increase(180 * 24 * 60 * 60); // 180 days

      // Claim
      await staking.connect(alice).claimRewards();
      const info1 = await staking.getUserInfo(alice.address);
      expect(info1.totalRewardsClaimed).to.be.gt(0);

      // Wait more
      await time.increase(180 * 24 * 60 * 60); // another 180 days

      // New rewards should accrue
      const pending = await staking.getPendingRewards(alice.address);
      expect(pending).to.be.gt(0);
    });

    it("should revert claim when reward pool is empty", async function () {
      // Deploy fresh staking with no funds
      const StakingFactory = await ethers.getContractFactory("MegiculaStaking");
      const emptyStaking = await StakingFactory.deploy(await token.getAddress(), APY_BPS);

      // Stake (need tokens in contract for unstake, but not rewards)
      await token.connect(alice).approve(await emptyStaking.getAddress(), ethers.parseEther("1000"));
      await emptyStaking.connect(alice).stake(ethers.parseEther("1000"));

      await time.increase(ONE_YEAR);

      // Claim should fail — no reward pool
      await expect(emptyStaking.connect(alice).claimRewards()).to.be.revertedWithCustomError(
        emptyStaking,
        "InsufficientRewardPool"
      );
    });

    it("should preserve totalRewardsClaimed after emergency withdraw", async function () {
      await stakeAs(alice, ethers.parseEther("5000"));
      await time.increase(ONE_YEAR);

      // Claim first
      await staking.connect(alice).claimRewards();
      const claimedBefore = (await staking.getUserInfo(alice.address)).totalRewardsClaimed;

      // Emergency withdraw
      await staking.connect(alice).emergencyWithdraw();
      const claimedAfter = (await staking.getUserInfo(alice.address)).totalRewardsClaimed;

      // Should preserve historical claim record
      expect(claimedAfter).to.equal(claimedBefore);
    });
  });
});
