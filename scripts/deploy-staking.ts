import { ethers, run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║        Megicula Stake — Deploy MegiculaStaking          ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("  Network      :", network.name);
  console.log("  Chain ID     :", (await ethers.provider.getNetwork()).chainId);
  console.log("  Deployer     :", deployer.address);
  console.log("  Balance      :", ethers.formatEther(balance), "OPN\n");

  // ─── Load token address ────────────────────────────────────────

  const tokenAddress = getContractAddress("MEGICULA_TOKEN_ADDRESS");
  if (!tokenAddress) {
    console.error("  [ERROR] MEGICULA_TOKEN_ADDRESS not found in frontend/config/contracts.ts");
    console.error("          Run deploy-token.ts first.\n");
    process.exit(1);
  }
  console.log("  Staking Token:", tokenAddress);

  // ─── Config ────────────────────────────────────────────────────

  const APY_BPS = 1000; // 10%
  console.log("  Initial APY  :", APY_BPS / 100, "%\n");

  // ─── Deploy ────────────────────────────────────────────────────

  console.log("  Deploying MegiculaStaking...");

  const StakingFactory = await ethers.getContractFactory("MegiculaStaking");
  const staking = await StakingFactory.deploy(tokenAddress, APY_BPS);
  const receipt = await staking.deploymentTransaction()?.wait();

  const stakingAddress = await staking.getAddress();
  const txHash = receipt?.hash ?? "N/A";

  console.log("  ┌──────────────────────────────────────────────────────┐");
  console.log(`  │  Contract Address : ${stakingAddress}`);
  console.log(`  │  Transaction Hash : ${txHash}`);
  console.log(`  │  Gas Used         : ${receipt?.gasUsed?.toString() ?? "N/A"}`);
  console.log("  └──────────────────────────────────────────────────────┘\n");

  // ─── Explorer URL ──────────────────────────────────────────────

  const explorerBase = network.name === "opnTestnet"
    ? "https://testnet.opnscan.io"
    : `https://${network.name}.etherscan.io`;

  console.log("  Explorer:");
  console.log(`    Contract : ${explorerBase}/address/${stakingAddress}`);
  console.log(`    Tx       : ${explorerBase}/tx/${txHash}\n`);

  // ─── Save to frontend config ──────────────────────────────────

  saveContractAddress("MEGICULA_STAKING_ADDRESS", stakingAddress, explorerBase);

  // ─── Fund reward pool (optional) ───────────────────────────────

  const fundAmountStr = process.env.FUND_REWARDS;
  if (fundAmountStr) {
    const fundAmount = ethers.parseEther(fundAmountStr);
    console.log(`  Funding reward pool with ${fundAmountStr} MEGA...`);

    const token = await ethers.getContractAt("MegiculaToken", tokenAddress);
    const approveTx = await token.approve(stakingAddress, fundAmount);
    await approveTx.wait();

    const fundTx = await staking.fundRewards(fundAmount);
    await fundTx.wait();

    console.log("  [OK] Reward pool funded!\n");
  } else {
    console.log("  [INFO] To fund reward pool, set FUND_REWARDS env var:");
    console.log("         FUND_REWARDS=10000000 npx hardhat run scripts/deploy-staking.ts --network opnTestnet\n");
  }

  // ─── Verify (skip for localhost / hardhat) ─────────────────────

  const etherscanKey = process.env.ETHERSCAN_API_KEY || "";

  if (network.name !== "hardhat" && network.name !== "localhost") {
    if (etherscanKey && etherscanKey !== "placeholder") {
      console.log("  Waiting for block confirmations...");
      await staking.deploymentTransaction()?.wait(5);

      try {
        console.log("  Verifying contract on explorer...");
        await run("verify:verify", {
          address: stakingAddress,
          constructorArguments: [tokenAddress, APY_BPS],
        });
        console.log("  [OK] Contract verified!\n");
      } catch (error: any) {
        if (error.message.includes("Already Verified")) {
          console.log("  [OK] Contract already verified.\n");
        } else {
          console.log("  [WARN] Verification failed:", error.message);
        }
      }
    } else {
      console.log("  [SKIP] Auto-verification skipped (no ETHERSCAN_API_KEY).");
    }

    console.log("  Verify manually:");
    console.log(`    npx hardhat verify --network ${network.name} ${stakingAddress} "${tokenAddress}" ${APY_BPS}\n`);
  } else {
    console.log("  [SKIP] Verification skipped (local network).\n");
  }

  console.log("  Staking contract deployment complete!\n");
  console.log("  Next steps:");
  console.log("    1. Fund reward pool (if not done above)");
  console.log("    2. Configure frontend with contract addresses");
  console.log("    3. Build and deploy frontend\n");
}

function getContractAddress(key: string): string | null {
  const configFile = path.join(__dirname, "..", "frontend", "config", "contracts.ts");
  if (!fs.existsSync(configFile)) return null;

  const content = fs.readFileSync(configFile, "utf-8");
  const regex = new RegExp(`${key}:\\s*"([^"]*)"`, "g");
  const match = regex.exec(content);
  return match ? match[1] : null;
}

function saveContractAddress(key: string, address: string, explorerBase: string) {
  const configDir = path.join(__dirname, "..", "frontend", "config");
  const configFile = path.join(configDir, "contracts.ts");

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let content = "";
  if (fs.existsSync(configFile)) {
    content = fs.readFileSync(configFile, "utf-8");
  } else {
    content = `// Auto-generated by deployment scripts
// Do not edit manually

export const CONTRACTS = {
`;
  }

  const regex = new RegExp(`${key}:\\s*"[^"]*"`, "g");
  if (content.includes(`${key}:`)) {
    content = content.replace(regex, `${key}: "${address}"`);
  } else {
    content = content.replace(/};\s*$/, `  ${key}: "${address}",\n};\n`);
  }

  fs.writeFileSync(configFile, content, "utf-8");
  console.log(`  [OK] Saved ${key} to frontend/config/contracts.ts`);
}

main().catch((error) => {
  console.error("\n  [ERROR]", error.message);
  process.exitCode = 1;
});
