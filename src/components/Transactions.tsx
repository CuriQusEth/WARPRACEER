import { useState, useEffect } from 'react';
import { useSendTransaction, useAccount, useCapabilities, useSendCalls } from 'wagmi';
import { parseEther, type Hex, toHex, stringToHex } from 'viem';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { buildERC8021Suffix, appendERC8021 } from '../lib/erc8021';

export const ATTRIBUTION_CODE = "WARP_RACER_X";
export const BUILDER_CODE = "bc_p233xxu5";

export function Transactions({ onTxSuccess }: { onTxSuccess?: () => void }) {
  const { address } = useAccount();
  const { sendTransaction, isPending: isTxPending, isSuccess: isTxSuccess, data: hash } = useSendTransaction();
  
  // EIP-5792 Support
  const { data: capabilities } = useCapabilities();
  const { sendCalls, isPending: isBatchPending, isSuccess: isBatchSuccess } = useSendCalls();
  
  const chainId = 8453; // Base Mainnet
  const isBatchSupported = capabilities?.[chainId]?.atomic?.status === 'ready' || capabilities?.[chainId]?.atomic?.status === 'supported';

  useEffect(() => {
    if (isTxSuccess || isBatchSuccess) {
      setTimeout(() => {
        onTxSuccess?.();
      }, 1500);
    }
  }, [isTxSuccess, isBatchSuccess, onTxSuccess]);

  const handleSendTransaction = () => {
    const dataSuffix = buildERC8021Suffix([ATTRIBUTION_CODE, BUILDER_CODE]);
    sendTransaction({
      to: "0x0000000000000000000000000000000000008021",
      value: parseEther("0"),
      data: appendERC8021(stringToHex("INIT_RACE"), [ATTRIBUTION_CODE, BUILDER_CODE])
    });
  };

  const handleBatchTransaction = () => {
    if (!address) return;
    
    sendCalls({
      calls: [
        {
          to: "0x0000000000000000000000000000000000008021",
          value: parseEther("0"),
          data: stringToHex("RACE_TICKET_1")
        },
        {
          to: "0x0000000000000000000000000000000000008021",
          value: parseEther("0"),
          data: stringToHex("RACE_TICKET_2")
        }
      ],
      capabilities: {
        dataSuffix: {
          value: buildERC8021Suffix([ATTRIBUTION_CODE, BUILDER_CODE]),
          optional: true
        }
      } as any
    });
  };

  const sendGMTransaction = () => {
    sendTransaction({
      to: "0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3",
      data: appendERC8021(stringToHex("gm"), [ATTRIBUTION_CODE, BUILDER_CODE])
    });
  };

  return (
    <div className="flex flex-col items-center">
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
        <button
          onClick={sendGMTransaction}
          disabled={isTxPending || isBatchPending}
          className="px-4 py-2 bg-[#0052FF]/20 border border-[#0052FF]/50 hover:bg-[#0052FF]/40 rounded-xl text-xs font-bold text-[#0052FF] flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <span>Say GM (On-Chain)</span>
        </button>

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
              href={`https://basescan.org/tx/${hash}`} 
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
