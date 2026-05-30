import { expect } from "chai";
import { ethers } from "hardhat";
import { MegiculaToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MegiculaToken", function () {
  let token: MegiculaToken;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100 M MEGA
  const NAME = "Megicula Token";
  const SYMBOL = "MEGA";

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MegiculaToken");
    token = await TokenFactory.deploy();
  });

  // ───────────────────────────────────────────────────────────────────
  //  Deployment
  // ───────────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("should set the correct token name", async function () {
      expect(await token.name()).to.equal(NAME);
    });

    it("should set the correct token symbol", async function () {
      expect(await token.symbol()).to.equal(SYMBOL);
    });

    it("should mint 100 M MEGA to the deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("should set total supply to 100 M", async function () {
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("should set deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Transfers
  // ───────────────────────────────────────────────────────────────────

  describe("Transfers", function () {
    it("should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("1000");
      await token.transfer(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(amount);
    });

    it("should emit Transfer event", async function () {
      const amount = ethers.parseEther("500");
      await expect(token.transfer(alice.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, alice.address, amount);
    });

    it("should revert when transferring more than balance", async function () {
      const amount = ethers.parseEther("1");
      await expect(token.connect(alice).transfer(bob.address, amount)).to.be.reverted;
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Approvals
  // ───────────────────────────────────────────────────────────────────

  describe("Approvals", function () {
    it("should approve spender", async function () {
      const amount = ethers.parseEther("5000");
      await token.approve(alice.address, amount);
      expect(await token.allowance(owner.address, alice.address)).to.equal(amount);
    });

    it("should allow transferFrom after approval", async function () {
      const amount = ethers.parseEther("1000");
      await token.approve(alice.address, amount);
      await token.connect(alice).transferFrom(owner.address, bob.address, amount);
      expect(await token.balanceOf(bob.address)).to.equal(amount);
    });

    it("should emit Approval event", async function () {
      const amount = ethers.parseEther("2000");
      await expect(token.approve(alice.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, alice.address, amount);
    });
  });

  // ───────────────────────────────────────────────────────────────────
  //  Burning
  // ───────────────────────────────────────────────────────────────────

  describe("Burning", function () {
    it("should allow holder to burn own tokens", async function () {
      const burnAmount = ethers.parseEther("1000000");
      const supplyBefore = await token.totalSupply();
      await token.burn(burnAmount);
      expect(await token.totalSupply()).to.equal(supplyBefore - burnAmount);
    });

    it("should reduce burner balance after burn", async function () {
      const burnAmount = ethers.parseEther("500");
      const balBefore = await token.balanceOf(owner.address);
      await token.burn(burnAmount);
      expect(await token.balanceOf(owner.address)).to.equal(balBefore - burnAmount);
    });

    it("should allow burnFrom with approval", async function () {
      const amount = ethers.parseEther("100");
      await token.transfer(alice.address, amount);
      await token.connect(alice).approve(owner.address, amount);
      await token.burnFrom(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(0);
    });
  });
});
