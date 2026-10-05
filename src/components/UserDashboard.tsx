import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Building,
  KeyRound,
  RefreshCw,
  Clock,
  User as UserIcon,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Home,
  Mail,
  Edit3,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { formatINR, numberToWordsINR, formatAadhaar } from '../utils/formatters';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    transactions,
    withdrawals,
    smsNotifications,
    requestWithdrawal,
    updateBankDetails,
    logout,
  } = useWallet();

  // Navigation & Modals
  const [activeBottomNav, setActiveBottomNav] = useState<'home' | 'history' | 'notice' | 'bank' | 'profile'>('home');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // Bank Form State
  const [bankName, setBankName] = useState(currentUser?.bankDetails?.bankName || '');
  const [accountHolder, setAccountHolder] = useState(currentUser?.bankDetails?.accountHolder || currentUser?.name || '');
  const [accountNumber, setAccountNumber] = useState(currentUser?.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(currentUser?.bankDetails?.ifsc || '');
  const [accountType, setAccountType] = useState<'Savings Account' | 'Current Account'>(
    currentUser?.bankDetails?.accountType || 'Savings Account'
  );
  const [bankSuccessMsg, setBankSuccessMsg] = useState('');
  const [bankErrorMsg, setBankErrorMsg] = useState('');

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  if (!currentUser) return null;

  const isAccountActive = currentUser.status === 'active';
  const hasLinkedBank = Boolean(
    currentUser.bankDetails &&
    currentUser.bankDetails.bankName &&
    currentUser.bankDetails.accountNumber &&
    currentUser.bankDetails.ifsc
  );

  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);
  const userWithdrawals = withdrawals.filter((w) => w.userId === currentUser.id);
  const userNotifs = smsNotifications.filter((n) => n.userId === currentUser.id);

  // Get Initials for avatar badge if needed
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setBankErrorMsg('');
    setBankSuccessMsg('');

    if (!bankName.trim() || !accountNumber.trim() || !ifsc.trim()) {
      setBankErrorMsg('Please fill in all bank account details.');
      return;
    }

    const res = updateBankDetails({
      bankName: bankName.trim(),
      accountHolder: (accountHolder || currentUser.name).trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      accountType,
    });

    if (res.success) {
      setBankSuccessMsg('Bank details saved successfully!');
      setTimeout(() => {
        setBankSuccessMsg('');
        setShowBankModal(false);
      }, 1200);
    } else {
      setBankErrorMsg(res.message);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (!hasLinkedBank) {
      setWithdrawError('Please link your Bank Account Details first before requesting withdrawal.');
      setShowWithdrawModal(false);
      setShowBankModal(true);
      return;
    }

    const numericAmount = parseFloat(withdrawAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setWithdrawError('Please enter a valid numeric amount to withdraw.');
      return;
    }

    if (!isAccountActive) {
      setWithdrawError('Account status is INACTIVE. Withdrawals are disabled.');
      return;
    }

    if (numericAmount > currentUser.balance) {
      setWithdrawError(`Insufficient funds. Your maximum balance is ${formatINR(currentUser.balance)}.`);
      return;
    }

    const res = requestWithdrawal(numericAmount);

    if (res.success) {
      setWithdrawSuccess(res.message);
      setWithdrawAmount('');
      setTimeout(() => {
        setWithdrawSuccess('');
        setShowWithdrawModal(false);
      }, 1800);
    } else {
      setWithdrawError(res.message);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 pb-28 pt-3 sm:pt-6 px-3 sm:px-6 max-w-xl mx-auto space-y-4 font-sans antialiased">
      {/* 1. TOP HEADER (MATCHING SCREENSHOT: GREEN GLOW DOT + METAL • SPACE + ICONS) */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isAccountActive
                ? 'bg-emerald-400 shadow-[0_0_10px_#10e64b]'
                : 'bg-rose-500 shadow-[0_0_10px_#ef4444]'
            }`}
          />
          <span className="text-sm sm:text-base font-extrabold tracking-wider text-white font-mono uppercase">
            ROY INTERNATIONAL • SPACE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <button
            onClick={() => setShowNoticeModal(true)}
            className="p-2 rounded-full border border-slate-800 bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {userNotifs.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Refresh Icon */}
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-full border border-slate-800 bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Logout Icon */}
          <button
            onClick={logout}
            className="p-2 rounded-full border border-slate-800 bg-slate-950/70 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. USER PROFILE CARD (MATCHING SCREENSHOT) */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#070b14]/90 backdrop-blur-2xl border border-slate-800/90 p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Avatar Square with glowing neon green ring + status dot */}
          <div className="relative shrink-0">
            {currentUser.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-[20px] object-cover ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,230,75,0.4)]"
              />
            ) : (
              <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-[20px] bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xl sm:text-2xl text-white font-mono ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,230,75,0.4)]">
                {getInitials(currentUser.name)}
              </div>
            )}
            {/* Status dot badge at bottom right */}
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 ${
                isAccountActive
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10e64b]'
                  : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
              }`}
            />
          </div>

          {/* Name & ID pill */}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">
              {currentUser.name}
            </h2>

            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400">ID:</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/60 border border-emerald-500/70 text-emerald-400 shadow-[0_0_10px_rgba(16,230,75,0.2)] truncate max-w-[220px]">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOTAL BALANCE CARD (MATCHING SCREENSHOT) */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#070b14]/90 backdrop-blur-2xl border border-slate-800/90 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Top row: TOTAL BALANCE label + LIVE badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            TOTAL BALANCE
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase border border-emerald-500 text-emerald-400 bg-emerald-950/40 shadow-[0_0_8px_rgba(16,230,75,0.25)]">
            LIVE
          </span>
        </div>

        {/* Amount */}
        <div className="pt-1">
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
            ₹ {currentUser.balance.toLocaleString('en-IN')}
          </div>

          <p className="mt-2 text-[10px] sm:text-[11px] font-mono text-slate-400 tracking-wider uppercase">
            ACCOUNT BALANCE IN WORDS: {numberToWordsINR(currentUser.balance)}
          </p>
        </div>

        {/* Bottom tags: SECURED + STATUS PILL (GREEN IF ACTIVE, RED IF INACTIVE) */}
        <div className="pt-2 flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/60 text-xs text-slate-300 font-mono flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>SECURED</span>
          </div>

          {/* User's requirement: Active is green, Inactive is red */}
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 transition-all ${
              isAccountActive
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_14px_rgba(16,230,75,0.7)]'
                : 'bg-rose-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.7)]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isAccountActive ? 'bg-slate-950 animate-ping' : 'bg-white animate-pulse'
              }`}
            />
            <span>{isAccountActive ? '● ACTIVE' : '● INACTIVE'}</span>
          </div>
        </div>
      </div>

      {/* 4. ACTION BUTTONS GRID (MATCHING SCREENSHOT) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center pt-1">
        {/* 1. Withdraw (Glowing Green rounded square from screenshot) */}
        <button
          onClick={() => {
            if (!hasLinkedBank) {
              setShowBankModal(true);
            } else {
              setShowWithdrawModal(true);
            }
          }}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] bg-[#10e64b] hover:bg-[#0fd244] active:scale-95 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(16,230,75,0.65)] transition-all">
            <Building className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold text-emerald-400 tracking-wide">
            Withdraw
          </span>
        </button>

        {/* 2. Bank Details */}
        <button
          onClick={() => setShowBankModal(true)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] bg-[#070b14]/90 border border-slate-800 hover:border-slate-600 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md">
            <KeyRound className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]" />
          </div>
          <span className="text-xs font-medium text-slate-300">
            BankDetails
          </span>
        </button>

        {/* 3. Refresh */}
        <button
          onClick={() => window.location.reload()}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] bg-[#070b14]/90 border border-slate-800 hover:border-slate-600 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md">
            <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]" />
          </div>
          <span className="text-xs font-medium text-slate-300">
            Refresh
          </span>
        </button>

        {/* 4. History */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] bg-[#070b14]/90 border border-slate-800 hover:border-slate-600 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md">
            <Clock className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]" />
          </div>
          <span className="text-xs font-medium text-slate-300">
            History
          </span>
        </button>

        {/* 5. Account */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22px] bg-[#070b14]/90 border border-slate-800 hover:border-slate-600 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md">
            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]" />
          </div>
          <span className="text-xs font-medium text-slate-300">
            Account
          </span>
        </button>
      </div>

      {/* 5. TRANSACTIONS SECTION (MATCHING SCREENSHOT: "No transtion!" CARD) */}
      <div className="rounded-[24px] bg-[#070b14]/90 backdrop-blur-2xl border border-slate-800/90 p-5 shadow-2xl space-y-3">
        {userTransactions.length === 0 ? (
          <div className="py-6 text-center text-slate-300 text-sm font-medium">
            No transtion!
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/60 text-xs font-mono text-slate-400">
              <span>RECENT TRANSACTIONS</span>
              <span>{userTransactions.length} Total</span>
            </div>
            {userTransactions.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      t.type === 'credit'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    <ArrowUpRight
                      className={`h-4 w-4 ${t.type === 'credit' ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {t.description}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(t.date).toLocaleDateString('en-GB')} • Ref: {t.refNo}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      t.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.type === 'credit' ? '+' : '-'} {formatINR(t.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. FIXED BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#04060d]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {/* Home */}
          <button
            onClick={() => setActiveBottomNav('home')}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              activeBottomNav === 'home'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[11px]">Home</span>
          </button>

          {/* History */}
          <button
            onClick={() => {
              setActiveBottomNav('history');
              setShowHistoryModal(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              activeBottomNav === 'history'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-[11px]">History</span>
          </button>

          {/* Notice */}
          <button
            onClick={() => {
              setActiveBottomNav('notice');
              setShowNoticeModal(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 transition-colors relative ${
              activeBottomNav === 'notice'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="h-5 w-5" />
            {userNotifs.length > 0 && (
              <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
            <span className="text-[11px]">Notice</span>
          </button>

          {/* Bank */}
          <button
            onClick={() => {
              setActiveBottomNav('bank');
              setShowBankModal(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              activeBottomNav === 'bank'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="h-5 w-5" />
            <span className="text-[11px]">Bank</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              setActiveBottomNav('profile');
              setShowProfileModal(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              activeBottomNav === 'profile'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </nav>

      {/* ================= MODALS ================= */}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-[28px] bg-[#070b14] border border-emerald-500/50 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Withdrawal Desk</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Inactive check */}
            {!isAccountActive && (
              <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-rose-400" />
                <span>Account is currently Inactive. Withdrawals are disabled.</span>
              </div>
            )}

            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            {/* Bank summary */}
            {hasLinkedBank && currentUser.bankDetails && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Payout Destination</span>
                <p className="font-bold text-white">{currentUser.bankDetails.bankName}</p>
                <p className="text-slate-300">
                  A/C: •••• {currentUser.bankDetails.accountNumber.slice(-4)} • IFSC: {currentUser.bankDetails.ifsc}
                </p>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount to Withdraw (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-emerald-400 text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={100}
                    disabled={!isAccountActive}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-20 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-emerald-400 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={!isAccountActive}
                    onClick={() => setWithdrawAmount(currentUser.balance.toString())}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                  >
                    MAX ALL
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                  Available: {formatINR(currentUser.balance)}
                </span>
              </div>

              <button
                type="submit"
                disabled={!isAccountActive}
                className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isAccountActive
                    ? 'bg-[#10e64b] hover:bg-[#0fd244] text-slate-950 shadow-[0_0_15px_rgba(16,230,75,0.5)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>{isAccountActive ? 'Confirm Withdrawal' : 'Withdrawal Disabled (Inactive)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BANK DETAILS MODAL (REQUIREMENT: ADD FROM DASHBOARD BEFORE WITHDRAWAL) */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-[28px] bg-[#070b14] border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Bank Account Details</h3>
              </div>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {bankSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
                {bankSuccessMsg}
              </div>
            )}

            {bankErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                {bankErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveBankDetails} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India, HDFC"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder={currentUser.name}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 394820194851"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0004821"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) =>
                    setAccountType(e.target.value as 'Savings Account' | 'Current Account')
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Savings Account">Savings Account</option>
                  <option value="Current Account">Current Account</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-[28px] bg-[#070b14] border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>Withdrawals & Statements</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Withdrawals list */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                Withdrawal Requests ({userWithdrawals.length})
              </span>
              {userWithdrawals.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No withdrawal requests yet.</p>
              ) : (
                userWithdrawals.map((w) => (
                  <div key={w.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{formatINR(w.amount)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          w.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400'
                            : w.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      {w.bankDetails.bankName} (A/C ...{w.bankDetails.accountNumber.slice(-4)})
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(w.requestedAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTICE / NOTIFICATION MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-[28px] bg-[#070b14] border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-cyan-400" />
                <span>Notice Center</span>
              </h3>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {userNotifs.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">No notices or alerts.</p>
            ) : (
              <div className="space-y-2">
                {userNotifs.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <p className="font-semibold text-emerald-400 text-[11px]">{n.title}</p>
                    <p className="text-slate-300 mt-1 font-mono text-[11px]">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE / ACCOUNT MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-[28px] bg-[#070b14] border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-cyan-400" />
                <span>Account Information</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="h-14 w-14 rounded-2xl object-cover border border-emerald-400"
              />
              <div>
                <h4 className="font-bold text-white text-sm">{currentUser.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isAccountActive ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}
                >
                  STATUS: {currentUser.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-200">+91 {currentUser.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">UIDAI:</span>
                <span className="text-white font-semibold">{formatAadhaar(currentUser.aadhaar)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">PAN:</span>
                <span className="text-amber-400 font-bold">{currentUser.pan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bank Linked:</span>
                <span className="text-slate-200">
                  {hasLinkedBank ? currentUser.bankDetails?.bankName : 'Not Linked Yet'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowBankModal(true);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {hasLinkedBank ? 'Edit Bank Details →' : 'Link Bank Details →'}
              </button>

              <button
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
