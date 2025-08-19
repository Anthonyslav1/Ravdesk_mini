'use client';

import { base } from 'wagmi/chains';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import type { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

export function Providers(props: { children: ReactNode }) {
  // Create wagmi config for Base (supports reads/writes via wagmi hooks)
  const connectors = [
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Ravdesk Escrow',
    }),
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
            metadata: {
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Ravdesk Escrow',
              description: 'Multi-party escrow on Base',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://ravdesk.vercel.app',
              icons: [process.env.NEXT_PUBLIC_ICON_URL || ''],
            },
          }),
        ]
      : []),
    injected({ shimDisconnect: true }),
  ];

  const wagmiConfig = createConfig({
    chains: [base],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL), // optional; falls back to default if undefined
    },
    connectors,
    ssr: true,
  });

  // React Query client for wagmi
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: 'auto',
              theme: 'base',
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Ravdesk Escrow',
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
          }}
        >
          <MiniKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
            config={{
              appearance: {
                mode: 'auto',
                theme: 'base',
                name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Ravdesk Escrow',
                logo: process.env.NEXT_PUBLIC_ICON_URL,
              },
            }}
          >
            {props.children}
          </MiniKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

