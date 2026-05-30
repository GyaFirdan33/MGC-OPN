import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Megicula Stake | Secure Staking on OPN Chain",
  description:
    "Megicula Stake is a decentralized staking protocol built on OPN Testnet allowing users to earn passive rewards securely.",
  keywords: ["staking", "DeFi", "OPN", "IOPn", "blockchain", "crypto"],
  openGraph: {
    title: "Megicula Stake",
    description: "Secure. Stake. Earn on OPN Chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-surface text-foreground antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
