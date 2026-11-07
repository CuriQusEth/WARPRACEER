import { useConnect } from 'wagmi';

export function WalletConnector() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector, chainId: 8453 })}
          disabled={isPending}
          className="group relative flex-1 max-w-[300px]"
        >
          <div className="absolute inset-0 bg-[#0052FF] rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative px-6 py-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-white font-bold tracking-widest text-xs sm:text-sm uppercase flex items-center justify-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {/* Base Logo simple SVG */}
            <svg className="w-5 h-5 text-[#0052FF]" viewBox="0 0 200 200" fill="currentColor">
              <path d="M100,0 C44.7715,0 0,44.7715 0,100 C0,155.228 44.7715,200 100,200 C155.228,200 200,155.228 200,100 C200,44.7715 155.228,0 100,0 Z" fill="#0052FF"/>
              <circle cx="100" cy="100" r="50" fill="white"/>
            </svg>
            <span>{connector.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
