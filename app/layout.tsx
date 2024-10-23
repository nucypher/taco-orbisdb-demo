"use client";

import { fontGeist, fontHeading, fontSans, fontUrban } from "@/assets/fonts";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env.mjs";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { ODB } from "./context/OrbisContext";
import { TACoContextProvider } from "./context/TACoContext";
import { WalletProvider } from "./context/WalletContext";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const useQueryClient = () => {
  const [queryClient] = useState(() => new QueryClient());
  return queryClient;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const queryClient = useQueryClient();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable,
          fontGeist.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <ThirdwebProvider
                activeChain="ethereum"
                clientId={env.NEXT_PUBLIC_THIRDWEB_ID}
              >
                <ODB>
                  <TACoContextProvider>{children}</TACoContextProvider>
                </ODB>
              </ThirdwebProvider>
            </WalletProvider>
          </QueryClientProvider>

          <Toaster richColors closeButton />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
