import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useSendTransaction } from 'wagmi';
import { parseEther, type Hex } from 'viem';
import { Rocket, Trophy, Gamepad2, ShieldAlert, LogOut, Wallet, ChevronRight, Fingerprint } from 'lucide-react';
import { WalletConnector } from './components/WalletConnector';
import { Game } from './components/Game';
import { motion } from 'motion/react';
import { ENCODED_BUILDER_CODE } from './components/Transactions';

export default function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
    }
  }, [isConnected]);

  const handleLogin = async () => {
    if (!address) return;
    try {
      setIsAuthenticating(true);
      // Authentication through on-chain transaction with ERC-8021 Attribution Suffix
      await sendTransactionAsync({
        to: address,
        value: parseEther("0"),
        data: ENCODED_BUILDER_CODE as Hex
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("ERC-8021 Login Failed:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden selection:bg-[#0052FF]/30 select-none">
      {/* Background Atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0052FF] rounded-full blur-[160px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0052FF] rounded-full blur-[140px] opacity-15 pointer-events-none" />

      {/* App ID Meta Info (Visualized) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/40 tracking-widest uppercase z-50">
        <span>Base App ID: 68f407468c4fe3f562003d8e</span>
        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
      </div>

      <header className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 pt-12 sm:pt-8 pb-4">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0052FF] to-blue-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,82,255,0.4)]">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight italic">WARP RACER</h1>
            <div className="flex items-center text-[10px] text-blue-400 font-mono">
              <span className="mr-2">v2.0.4 - PRODUCTION READY</span>
              <span className="px-1.5 py-0.5 bg-blue-400/10 border border-blue-400/20 rounded">BASE MAINNET</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col items-end mr-4">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Attribution Active</span>
            <span className="text-xs font-mono text-blue-300 italic">***_********</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center space-x-3 shadow-inner">
            <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : isConnected ? 'bg-amber-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-sm font-medium">
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'DISCONNECTED'}
            </span>
            {isConnected && (
              <button
                onClick={() => disconnect()}
                className="ml-2 p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="relative flex flex-col">
              <div className="flex-1 bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-[40px] p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
                
                <div className="relative z-10 text-center w-full max-w-2xl">
                  <h2 className="text-5xl sm:text-6xl font-black italic tracking-tighter mb-2">WARP GATE 01</h2>
                  <p className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-10">Base Chain Main Circuit</p>
                  
                {!isConnected ? (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-white/60 mb-4 max-w-md mx-auto">Connect your wallet to enter the race, unlock achievements, and interact with the Base network.</p>
                    <WalletConnector />
                  </div>
                ) : !isAuthenticated ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-3xl bg-white/5 border border-amber-500/20 backdrop-blur-xl text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl">
                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Secure Authentication Required</h3>
                        <p className="text-white/60 mb-6 font-mono text-sm">Send a zero-cost transaction with an ERC-8021 valid builder code to authenticate your wallet on-chain.</p>
                        <button
                          onClick={handleLogin}
                          disabled={isAuthenticating}
                          className="group relative inline-block"
                        >
                          <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity" />
                          <div className="relative px-8 py-3 bg-[#0052FF] text-white rounded-full font-bold text-sm tracking-widest flex items-center space-x-3 border border-[#0052FF]">
                            <span>{isAuthenticating ? 'AUTHENTICATING...' : 'LOGIN VIA TXN'}</span>
                            <Fingerprint className="w-4 h-4 ml-2" />
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <Game />
                )}
                </div>
              </div>
            </section>
          </div>
          
          <aside className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-[#0052FF]/10 border border-[#0052FF]/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052FF] blur-3xl opacity-20" />
              <h3 className="text-[10px] text-blue-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Ecosystem Stack
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-sm font-medium">Chain Network</span>
                    <span className="text-white/40 text-[10px] uppercase">Base + Sepolia</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0052FF]/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#0052FF]" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-sm font-medium">Authentication</span>
                    <span className="text-white/40 text-[10px] uppercase">ERC-8021 Login Txn</span>
                  </div>
                  <Fingerprint className="w-5 h-5 text-[#0052FF]" />
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-sm font-medium">Builder Codes</span>
                    <span className="text-white/40 text-[10px] uppercase">ERC-8021 Ready</span>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl overflow-hidden">
              <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Circuit Leaders</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${i === 1 ? 'bg-white/5 border-l-2 border-yellow-400' : 'bg-transparent'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 1 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/10 text-white/60'
                      }`}>
                        {i}
                      </div>
                      <span className="text-xs font-medium">0x{Math.random().toString(16).slice(2, 6)}...</span>
                    </div>
                    <span className={`text-xs font-mono min-w-16 text-right ${i === 1 ? 'text-white/60' : 'text-white/40'}`}>
                      {10000 - i * 150} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#0052FF]/10 border border-[#0052FF]/20 rounded-3xl p-6">
              <h3 className="text-[10px] text-blue-300 uppercase tracking-widest mb-3">Builder Status</h3>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-1.5 bg-[#0052FF] rounded-md">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"/></svg>
                </div>
                <span className="text-xs font-bold">ERC-8021 ACTIVE</span>
              </div>
              <p className="text-[10px] text-blue-300/60 leading-relaxed">
                All transactions are securely attributed for rewards and ecosystem points.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="w-full h-12 bg-white/5 border-t border-white/10 flex items-center justify-between px-6 sm:px-8 text-[10px] text-white/40 tracking-wider uppercase mt-12 relative z-10">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span className="hidden sm:inline">Base Mainnet connected</span>
            <span className="sm:hidden">Connected</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">WAGMI v2.x</span>
          <span className="hidden sm:inline">VIEM v2.x</span>
          <span className="text-white/60 font-mono">Tx Suffix: ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
