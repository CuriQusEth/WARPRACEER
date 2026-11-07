import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// Base Denim Mainnet upgrade: 200ms native canonical blocks
export const baseDenimMainnet = {
  ...base,
  name: 'Base Denim Mainnet',
  pollingInterval: 250, // 200ms native canonical blocks
  rpcUrls: {
    ...base.rpcUrls,
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
};

const baseSepoliaDenim = {
  ...baseSepolia,
  pollingInterval: 250,
};

export const config = createConfig({
  chains: [baseDenimMainnet, baseSepoliaDenim],
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected({ target: 'metaMask' }),
    coinbaseWallet({ appName: 'Warp Racer', preference: 'all' }),
    walletConnect({ projectId: 'YOUR_PROJECT_ID_HERE', showQrModal: true })
  ],
  transports: {
    [baseDenimMainnet.id]: http('https://mainnet.base.org', { batch: true }),
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
