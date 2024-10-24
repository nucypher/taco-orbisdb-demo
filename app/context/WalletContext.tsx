import { env } from "@/env.mjs";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import React, { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { polygonAmoy } from "wagmi/chains";

const projectId = env.NEXT_PUBLIC_PROJECT_ID || "";

const config = getDefaultConfig({
  appName: "test-app",
  projectId,
  chains: [polygonAmoy],
  ssr: true,
});

interface WalletProviderProps {
  children: ReactNode;
}

// Create a provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
};
