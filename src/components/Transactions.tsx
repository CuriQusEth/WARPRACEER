import { useState, useEffect } from 'react';
import { useSendTransaction, useAccount, useCapabilities, useSendCalls } from 'wagmi';
import { parseEther, type Hex } from 'viem';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';

export const ENCODED_BUILDER_CODE = "0x62635f70323333787875350b0080218021802180218021802180218021";

export function Transactions({ onTxSuccess }: { onTxSuccess?: () => void }) {
  const { address } = useAccount();
  const { sendTransaction, isPending: isTxPending, isSuccess: isTxSuccess, data: hash } = useSendTransaction();
  
  // EIP-5792 Support
  const { data: capabilities } = useCapabilities();
  const { sendCalls, isPending: isBatchPending, isSuccess: isBatchSuccess } = useSendCalls();
  
  // Check if wallet supports batching on current chain (Base Sepolia is 84532)
  const isBatchSupported = capabilities && capabilities[84532]?.auxiliaryFunds?.supported;

  useEffect(() => {
    if (isTxSuccess || isBatchSuccess) {
      setTimeout(() => {
        onTxSuccess?.();
      }, 1500);
    }
  }, [isTxSuccess, isBatchSuccess, onTxSuccess]);

  const handleSendTransaction = () => {
    // Example: Sending a dummy transaction with ERC-8021 data suffix embedded
    sendTransaction({
      to: address, // sending to self for testing
      value: parseEther("0"),
      data: ENCODED_BUILDER_CODE as Hex
    });
  };

  const handleBatchTransaction = () => {
    if (!address) return;
    
    // Example EIP-5792: Sending multiple transactions together with DataSuffixCapability
    sendCalls({
      calls: [
        {
          to: address,
          value: parseEther("0"),
        },
        {
          to: address,
          value: parseEther("0"),
        }
      ],
      capabilities: {
        dataSuffix: {
          value: ENCODED_BUILDER_CODE,
          optional: true
        }
      } as any
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Button - The Batch Tx Core */}
      <button 
        onClick={handleBatchTransaction}
        disabled={isTxPending || isBatchPending || !isBatchSupported}
        className="group relative"
      >
        <div className="absolute inset-0 bg-[#0052FF] rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity"></div>
        <div className={`relative px-8 sm:px-12 py-4 sm:py-5 bg-[#0052FF] text-white rounded-full font-bold text-lg sm:text-xl tracking-widest flex items-center justify-center space-x-3 border border-white/20 transition-opacity ${(!isBatchSupported || isTxPending || isBatchPending) ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <span>{isBatchPending ? 'PROCESSING...' : 'INITIALIZE RACE'}</span>
          {isBatchPending ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>}
        </div>
      </button>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs flex items-center justify-center space-x-2">
          <span className="text-white/40">BATCH TX:</span>
          <span className={isBatchSupported ? "text-green-400" : "text-amber-400"}>
            {isBatchSupported ? "ENABLED (EIP-5792)" : "UNSUPPORTED"}
          </span>
        </div>
        
        <button
          onClick={handleSendTransaction}
          disabled={isTxPending || isBatchPending}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <span className="text-white/60">STANDARD TX INSTEAD</span>
          {isTxPending && <Loader2 className="w-3 h-3 animate-spin text-white/60" />}
        </button>
      </div>

      {isTxSuccess && (
        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 w-full max-w-sm mx-auto text-left">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <p className="text-green-400 font-medium text-sm">Race Initialized!</p>
            <a 
              href={`https://sepolia.basescan.org/tx/${hash}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-green-500/80 text-xs font-mono hover:underline truncate block w-full mt-1"
            >
              Tx: {hash?.slice(0, 10)}...{hash?.slice(-8)}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
