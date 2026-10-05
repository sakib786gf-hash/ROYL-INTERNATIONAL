import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Users,
  PlusCircle,
  CheckCircle,
  XCircle,
  Search,
  Building,
  UserPlus,
  Trash2,
  Eye,
  Power,
  RefreshCw,
  LogOut,
  Send,
  CreditCard,
  ArrowDownToLine,
  FileText,
  BellRing,
} from 'lucide-react';
import { formatINR, formatAadhaar } from '../utils/formatters';
import { User } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    withdrawals,
    transactions,
    adminAddFunds,
    adminToggleUserStatus,
    adminProcessWithdrawal,
    adminCreateUser,
    adminDeleteUser,
    adminSendNotificationAlert,
    logout,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'directory' | 'withdrawals' | 'ledger' | 'alerts'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add Funds Modal
  const [selectedUserForFunds, setSelectedUserForFunds] = useState<User | null>(null);
  const [fundsAmount, setFundsAmount] = useState<string>('50000');
  const [customFundsNote, setCustomFundsNote] = useState('');
  const [fundAddSuccess, setFundAddSuccess] = useState('');

  // View Dossier Modal
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);

  // Register User Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAadhaar, setNewUserAadhaar] = useState('');
  const [newUserPan, setNewUserPan] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('User@123');
  const [newUserBalance, setNewUserBalance] = useState('0');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'inactive'>('inactive'); // default inactive

  // Send Alert tab state
  const [alertTitle, setAlertTitle] = useState('Platform Liquidity Settlement');
  const [alertMessage, setAlertMessage] = useState('Settlement Notification: Direct settlement completed.');
  const [alertTargetId, setAlertTargetId] = useState<string>('all');
  const [alertSuccess, setAlertSuccess] = useState('');

  const PRESET_AMOUNTS = [10000, 50000, 100000, 500000, 1000000, 5000000];

  // Filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.aadhaar.includes(searchQuery);

    if (statusFilter === 'active') return matchesSearch && u.status === 'active';
    if (statusFilter === 'inactive') return matchesSearch && u.status === 'inactive';
    return matchesSearch;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  const handleExecuteAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForFunds) return;

    const amt = parseFloat(fundsAmount);
    if (isNaN(amt) || amt <= 0) return;

    adminAddFunds(selectedUserForFunds.id, amt, customFundsNote);
    setFundAddSuccess(`Deposited ${formatINR(amt)} to ${selectedUserForFunds.name}'s wallet successfully.`);

    setTimeout(() => {
      setFundAddSuccess('');
      setSelectedUserForFunds(null);
    }, 1500);
  };

  const handleRegisterUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone || !newUserAadhaar || !newUserPan) return;

    adminCreateUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone.replace(/\D/g, ''),
      password: newUserPassword,
      aadhaar: newUserAadhaar.replace(/\D/g, ''),
      pan: newUserPan.toUpperCase(),
      balance: parseFloat(newUserBalance) || 0,
      status: newUserStatus, // starts inactive as requested
    });

    setShowRegisterModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserAadhaar('');
    setNewUserPan('');
  };

  const handleSendAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertMessage) return;

    adminSendNotificationAlert(
      alertTitle,
      alertMessage,
      alertTargetId === 'all' ? undefined : alertTargetId
    );

    setAlertSuccess('Alert dispatched to notification bars.');
    setTimeout(() => setAlertSuccess(''), 2500);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5">
      {/* 1. TOP HEADER BANNER (EXACT MATCH WITH SCREENSHOT) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Admin Operations Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
              SYSTEM CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-amber-300 font-semibold">{currentUser?.email || 'izaz786@metal.com'}</span> • Full control to manage users, add balances, process withdrawals, and permanently delete accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Refresh</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/70 text-rose-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS (MATCHING SCREENSHOT) */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-800/80 overflow-x-auto text-xs sm:text-sm font-medium pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-2 whitespace-nowrap transition-colors relative ${
            activeTab === 'directory'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Users Directory & Balances ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-2 whitespace-nowrap transition-colors relative ${
            activeTab === 'withdrawals'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Withdrawal Approval Desk ({withdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-2 whitespace-nowrap transition-colors relative ${
            activeTab === 'ledger'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Master Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-2 whitespace-nowrap transition-colors relative ${
            activeTab === 'alerts'
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Send Notification Bar Alert
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY & BALANCES */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR (MATCHING SCREENSHOT) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name, email, phone, PAN..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Filter Pills + Register Button */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                Filter:
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'inactive'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Inactive ({inactiveCount})
              </button>

              {/* + Register User Green Button */}
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Register User</span>
              </button>
            </div>
          </div>

          {/* TABLE (EXACT ROW & COLUMN LAYOUT FROM SCREENSHOT) */}
          <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/70 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px] bg-slate-950/90">
                    <th className="py-3 px-4">USER & CONTACT</th>
                    <th className="py-3 px-4">GOVT KYC (AADHAAR & PAN)</th>
                    <th className="py-3 px-4">BANK ACCOUNT</th>
                    <th className="py-3 px-4">ACCOUNT BALANCE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        {/* USER & CONTACT */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.photoUrl}
                              alt={u.name}
                              className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm truncate">{u.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                              <p className="text-[11px] text-cyan-400 font-mono mt-0.5">
                                {u.phone.startsWith('+91') ? u.phone : `+91 ${u.phone}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* GOVT KYC (AADHAAR & PAN) */}
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <div>
                            <span className="text-[11px] text-slate-400">UIDAI: </span>
                            <span className="text-white font-semibold">{formatAadhaar(u.aadhaar)}</span>
                          </div>
                          <div className="mt-0.5">
                            <span className="text-[11px] text-slate-400">PAN: </span>
                            <span className="text-amber-400 font-bold uppercase">{u.pan}</span>
                          </div>
                          <button
                            onClick={() => setInspectedUser(u)}
                            className="mt-1 text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Full Dossier</span>
                          </button>
                        </td>

                        {/* BANK ACCOUNT */}
                        <td className="py-3.5 px-4 text-xs font-mono">
                          <div>
                            <span className="text-slate-400">A/C: </span>
                            <span className="text-slate-200">
                              {u.bankDetails
                                ? `•••• ${u.bankDetails.accountNumber.slice(-4)}`
                                : '••••'}
                            </span>
                          </div>
                          <div className="mt-0.5">
                            <span className="text-slate-400">IFSC: </span>
                            <span className="text-slate-300">
                              {u.bankDetails ? u.bankDetails.ifsc : '••••'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 border border-emerald-700/50 text-emerald-400">
                              {u.bankDetails ? u.bankDetails.accountType : 'Savings Account'}
                            </span>
                          </div>
                        </td>

                        {/* ACCOUNT BALANCE */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-base font-bold text-cyan-300 block">
                            {formatINR(u.balance)}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">
                            INR Liquid
                          </span>
                        </td>

                        {/* STATUS (CLICKABLE PILL BUTTON) */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => adminToggleUserStatus(u.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all border ${
                              u.status === 'active'
                                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                                : 'bg-rose-950/70 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                            }`}
                            title="Click to toggle Active / Inactive"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'
                              }`}
                            />
                            <span className="uppercase">{u.status}</span>
                          </button>
                        </td>

                        {/* ADMIN ACTIONS */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* + Add Funds Button */}
                            <button
                              onClick={() => {
                                setSelectedUserForFunds(u);
                                setFundsAmount('50000');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                              <span>+ Add Funds</span>
                            </button>

                            {/* Power Toggle Button */}
                            <button
                              onClick={() => adminToggleUserStatus(u.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                u.status === 'active'
                                  ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
                                  : 'bg-slate-900 border-slate-700 text-rose-400 hover:bg-slate-800'
                              }`}
                              title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>

                            {/* Red Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Permanently delete account for ${u.name}?`)) {
                                  adminDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-400 transition-colors"
                              title="Permanently Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WITHDRAWAL APPROVAL DESK */}
      {activeTab === 'withdrawals' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-cyan-400" />
                <span>Withdrawal Approval Desk</span>
              </h3>
              <p className="text-xs text-slate-400">
                Process user payouts. Approving dispatches funds; Rejecting returns funds back to the user's wallet.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {withdrawals.length} Total Requests
            </span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No withdrawal requests logged on this desk.
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white font-mono">
                        {formatINR(w.amount)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          w.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                            : w.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-700/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      User: <strong className="text-white">{w.userName}</strong> (+91 {w.userPhone})
                    </p>

                    <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Bank: {w.bankDetails.bankName}</span>
                      <span>A/C: {w.bankDetails.accountNumber}</span>
                      <span>IFSC: {w.bankDetails.ifsc}</span>
                      <span>Holder: {w.bankDetails.accountHolder}</span>
                      <span>Type: {w.bankDetails.accountType}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-mono">
                      Requested: {new Date(w.requestedAt).toLocaleString('en-GB')}
                    </p>
                  </div>

                  {w.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => adminProcessWithdrawal(w.id, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve Payout</span>
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Optional rejection note:');
                          adminProcessWithdrawal(w.id, 'rejected', reason || 'Declined');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject & Refund</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-mono md:text-right">
                      <span className="block text-[10px] text-slate-500">Processed At</span>
                      <span>{w.processedAt ? new Date(w.processedAt).toLocaleTimeString() : 'Completed'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLATFORM MASTER LEDGER */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Platform Master Ledger</span>
              </h3>
              <p className="text-xs text-slate-400">
                Complete record of all direct deposits, remittances, and platform transactions.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {transactions.length} Records
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No transactions recorded in master ledger.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Ref No</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/30">
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(t.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-3 text-cyan-400 font-semibold">{t.refNo}</td>
                      <td className="py-3 px-3 text-slate-200">{t.description}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            t.type === 'credit'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatINR(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SEND NOTIFICATION BAR ALERT */}
      {activeTab === 'alerts' && (
        <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <BellRing className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Send Notification Bar Alert</h3>
              <p className="text-xs text-slate-400">
                Broadcast a message directly into user notification centers without popups.
              </p>
            </div>
          </div>

          {alertSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
              {alertSuccess}
            </div>
          )}

          <form onSubmit={handleSendAlertSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target User
              </label>
              <select
                value={alertTargetId}
                onChange={(e) => setAlertTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Registered Users ({users.length})</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (+91 {u.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alert Title
              </label>
              <input
                type="text"
                required
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alert Content / Message
              </label>
              <textarea
                required
                rows={3}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast Notification Bar Alert</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ADD UNLIMITED FUNDS */}
      {selectedUserForFunds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Add Unlimited Funds</h3>
              </div>
              <button
                onClick={() => setSelectedUserForFunds(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {fundAddSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-emerald-300">{fundAddSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleExecuteAddFunds} className="space-y-4 mt-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img
                    src={selectedUserForFunds.photoUrl}
                    alt={selectedUserForFunds.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedUserForFunds.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Current: {formatINR(selectedUserForFunds.balance)} • Phone: +91 {selectedUserForFunds.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Amount to Add (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-400 font-mono font-bold text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={fundsAmount}
                      onChange={(e) => setFundsAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFundsAmount(amt.toString())}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700"
                      >
                        +{formatINR(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Direct Banking Credit Reference
                  </label>
                  <input
                    type="text"
                    value={customFundsNote}
                    onChange={(e) => setCustomFundsNote(e.target.value)}
                    placeholder="e.g. IMPS Inward Remittance - Direct Bank Settlement"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Execute Deposit into Wallet</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VIEW FULL DOSSIER */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Customer Verification Dossier</span>
              </h3>
              <button
                onClick={() => setInspectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <img
                src={inspectedUser.photoUrl}
                alt={inspectedUser.name}
                className="h-14 w-14 rounded-xl object-cover border border-cyan-400 shrink-0"
              />
              <div>
                <h4 className="text-base font-bold text-white">{inspectedUser.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{inspectedUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      inspectedUser.status === 'active'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    STATUS: {inspectedUser.status}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {formatINR(inspectedUser.balance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-200">+91 {inspectedUser.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">UIDAI Aadhaar:</span>
                <span className="text-white font-semibold">{formatAadhaar(inspectedUser.aadhaar)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Income Tax PAN:</span>
                <span className="text-amber-400 font-bold">{inspectedUser.pan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Bank Name:</span>
                <span className="text-slate-200">{inspectedUser.bankDetails?.bankName || 'Not Linked Yet'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Account Number:</span>
                <span className="text-slate-200">{inspectedUser.bankDetails?.accountNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">IFSC Code:</span>
                <span className="text-slate-200">{inspectedUser.bankDetails?.ifsc || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Type:</span>
                <span className="text-slate-200">{inspectedUser.bankDetails?.accountType || 'Savings Account'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER USER (FROM ADMIN DESK) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <span>Register User to Platform</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterUserSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Asif Iqbal"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Aadhaar (UIDAI)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={formatAadhaar(newUserAadhaar)}
                    onChange={(e) => setNewUserAadhaar(e.target.value)}
                    placeholder="1234 5678 9012"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newUserPan.toUpperCase()}
                    onChange={(e) => setNewUserPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Initial Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={newUserBalance}
                    onChange={(e) => setNewUserBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="inactive">Inactive (Default)</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
