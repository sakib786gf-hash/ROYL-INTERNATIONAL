import React, { useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { MessageSquare, X, ShieldCheck } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const SMSAlertToast: React.FC = () => {
  const { activeSMSPopup, dismissSMSPopup, currentUser } = useWallet();

  useEffect(() => {
    if (activeSMSPopup) {
      const timer = setTimeout(() => {
        dismissSMSPopup();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeSMSPopup, dismissSMSPopup]);

  if (!activeSMSPopup || !currentUser) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md animate-bounce-in">
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/95 border-2 border-emerald-500/70 p-4 shadow-2xl shadow-emerald-500/20 backdrop-blur-2xl text-slate-100">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* SMS Icon */}
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,230,75,0.4)]">
            <MessageSquare className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                ROY BANKING • SMS ALERT
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              {activeSMSPopup.message}
            </p>

            {activeSMSPopup.amount && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-xs font-bold">
                <span>CREDITED:</span>
                <span>+{formatINR(activeSMSPopup.amount)}</span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={dismissSMSPopup}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
