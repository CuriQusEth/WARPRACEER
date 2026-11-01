import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// Base Denim upgrade: 200ms native canonical blocks replacing Flashblocks
const baseDenim = {
  ...base,
  pollingInterval: 250, // Tuned for 200ms native blocks
};

const baseSepoliaDenim = {
  ...baseSepolia,
  pollingInterval: 250,
};

export const config = createConfig({
  chains: [baseDenim, baseSepoliaDenim],
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected({ target: 'metaMask' }),
    coinbaseWallet({ appName: 'Warp Racer', preference: 'all' }),
    walletConnect({ projectId: 'YOUR_PROJECT_ID_HERE', showQrModal: true })
  ],
  transports: {
    [baseDenim.id]: http(undefined, { batch: true }),
    [baseSepoliaDenim.id]: http(undefined, { batch: true }),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Fast canonical state updates for 200ms block times
        refetchOnWindowFocus: false,
        staleTime: 500,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
