import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Bell,
  Sparkles,
  LogOut,
  ChevronDown,
  Check,
  CheckCircle2,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    smsNotifications,
    markNotificationsAsRead,
    logout,
    switchActiveUser,
    isAdminMode,
  } = useWallet();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const userNotifs = currentUser
    ? smsNotifications.filter((n) => n.userId === currentUser.id)
    : [];
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleOpenNotifs = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && currentUser) {
      markNotificationsAsRead(currentUser.id);
    }
  };

  const isUserAdmin = currentUser?.role === 'admin' || isAdminMode;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-transparent uppercase font-mono">
                ROY INTERNATIONAL
              </span>
              {isUserAdmin ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase font-bold">
                  Admin System
                </span>
              ) : (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono tracking-widest bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                  WALLET
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider">
              {isUserAdmin
                ? 'Central Liquidity & Management Dashboard'
                : 'Autonomous Digital Asset & Reserve Banking'}
            </p>
          </div>
        </div>

        {/* Right Section */}
        {currentUser && (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Account Status Badge (For regular users: RED if inactive, GREEN if active) */}
            {!isUserAdmin && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                  currentUser.status === 'active'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                    : 'bg-red-950/60 border-red-500/50 text-red-300 shadow-sm shadow-red-500/20'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full animate-ping ${
                    currentUser.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
                <span className="font-mono">
                  {currentUser.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            )}

            {/* Notification Bell (Only for users) */}
            {!isUserAdmin && (
              <div className="relative">
                <button
                  onClick={handleOpenNotifs}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
                  title="Banking Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 ring-2 ring-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-4 text-slate-100 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-cyan-400" />
                        <h4 className="text-sm font-bold tracking-wide">Notifications & Alerts</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {userNotifs.length} total alerts
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {userNotifs.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">
                          No notifications received yet.
                        </p>
                      ) : (
                        userNotifs.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 hover:border-slate-700 transition-all text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="h-3 w-3" />
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Info */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200">
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border border-cyan-500/50"
              />
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold block leading-tight max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                {!isUserAdmin && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block leading-tight">
                    {formatINR(currentUser.balance)}
                  </span>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-red-950/40 border border-slate-700/60 hover:border-red-500/40 text-slate-300 hover:text-red-400 transition-colors text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
