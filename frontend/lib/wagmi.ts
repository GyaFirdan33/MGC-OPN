import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { defineChain } from "viem";

export const opnTestnet = defineChain({
  id: 984,
  name: "OPN Testnet",
  nativeCurrency: {
    name: "OPN",
    symbol: "OPN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.iopn.tech"],
    },
  },
  blockExplorers: {
    default: {
      name: "OPN Scan",
      url: "https://testnet.opnscan.io",
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "Megicula Stake",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "99f99c5697cb3b6739a35f1f7742de46",
  chains: [opnTestnet],
  transports: {
    [opnTestnet.id]: http("https://testnet-rpc.iopn.tech"),
  },
});
