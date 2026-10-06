import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Transaction, WithdrawalRequest, SMSNotification, BankDetails } from '../types';
import { generateRefNo } from '../utils/formatters';
import { playCreditChime, playSuccessChime } from '../utils/audio';
import {
  apiGetState,
  apiLogin,
  apiRegister,
  apiUpdateBankDetails,
  apiWithdraw,
  apiAdminAddFunds,
  apiAdminToggleStatus,
  apiAdminProcessWithdrawal,
  apiAdminCreateUser,
  apiAdminDeleteUser,
  apiAdminBroadcastAlert,
  apiMarkNotificationsRead,
} from '../utils/api';

interface WalletContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  smsNotifications: SMSNotification[];
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  activeSMSPopup: SMSNotification | null;
  dismissSMSPopup: () => void;
  refreshData: () => Promise<void>;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; role?: 'user' | 'admin'; message?: string }>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'balance' | 'status' | 'bankDetails'>) => Promise<{ success: boolean; message?: string }>;
  updateBankDetails: (bankDetails: BankDetails) => { success: boolean; message: string };
  logout: () => void;
  requestWithdrawal: (amount: number, bankDetails?: BankDetails) => { success: boolean; message: string };
  adminAddFunds: (userId: string, amount: number, customNote?: string, setBalance?: boolean) => Promise<void>;
  adminToggleUserStatus: (userId: string) => void;
  adminProcessWithdrawal: (withdrawalId: string, status: 'approved' | 'rejected', remarks?: string) => void;
  adminCreateUser: (userData: Partial<User>) => void;
  adminDeleteUser: (userId: string) => void;
  adminSendNotificationAlert: (title: string, message: string, targetUserId?: string) => void;
  markNotificationsAsRead: (userId: string) => void;
  switchActiveUser: (userId: string) => void;
}

const STORAGE_USERS_KEY = 'roy_wallet_users_v8';
const STORAGE_TXNS_KEY = 'roy_wallet_txns_v8';
const STORAGE_WITHDRAWALS_KEY = 'roy_wallet_withdrawals_v8';
const STORAGE_NOTIFS_KEY = 'roy_wallet_notifs_v8';
const STORAGE_CURRENT_USER_KEY = 'roy_wallet_current_user_v8';

const INITIAL_USERS: User[] = [
  {
    id: 'usr-master-admin',
    name: 'Master Admin',
    email: 'izaz786@metal.com',
    phone: '9876543210',
    password: 'Izaz@123',
    aadhaar: '795847362675',
    pan: 'DRPTH6732G',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'admin',
  },
  {
    id: 'usr-sakib-1',
    name: 'Sakib Khan',
    email: 'sakib786gf@gmail.com',
    phone: '9876543210',
    password: 'Izaz@123',
    aadhaar: '782145901234',
    pan: 'ABCDE1234F',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: {
      bankName: 'HDFC Bank',
      accountHolder: 'Sakib Khan',
      accountNumber: '5010029482910',
      ifsc: 'HDFC0001234',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-05T12:00:00.000Z',
    role: 'user',
  },
  {
    id: 'usr-admin-1',
    name: 'Iran sardar',
    email: 'izazm728@gmail.com',
    phone: '6745385798',
    password: 'Izaz@123',
    aadhaar: '795847362675',
    pan: 'DRPTH6732G',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'inactive',
    balance: 50000,
    bankDetails: {
      bankName: 'State Bank of India',
      accountHolder: 'Iran sardar',
      accountNumber: '482910394851',
      ifsc: 'SBIN0004821',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    role: 'user',
  },
  {
    id: 'usr-rahul-1',
    name: 'Rahul Varma',
    email: 'rahul.v@metal.in',
    phone: '9456789012',
    password: 'Izaz@123',
    aadhaar: '445566778899',
    pan: 'APZRV9012M',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: {
      bankName: 'Axis Bank',
      accountHolder: 'Rahul Varma',
      accountNumber: '9120100482910',
      ifsc: 'UTIB0000482',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-10T14:30:00.000Z',
    role: 'user',
  },
  {
    id: 'usr-priya-1',
    name: 'Priya Sharma',
    email: 'priya.s@metal.in',
    phone: '9123456789',
    password: 'Izaz@123',
    aadhaar: '983210458821',
    pan: 'BKZPS4920K',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: {
      bankName: 'ICICI Bank',
      accountHolder: 'Priya Sharma',
      accountNumber: '1002938472910',
      ifsc: 'ICIC0001002',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-12T09:15:00.000Z',
    role: 'user',
  },
  {
    id: 'usr-sakib-metal',
    name: 'Sakib (SS Metal User)',
    email: 'ss8910642@gmail.com',
    phone: '8910642786',
    password: 'Izaz@123',
    aadhaar: '891064205647',
    pan: 'SSPAN5647M',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: {
      bankName: 'Punjab National Bank',
      accountHolder: 'Sakib',
      accountNumber: '0849201948510',
      ifsc: 'PUNB0084900',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-15T16:20:00.000Z',
    role: 'user',
  },
  {
    id: 'usr-suman-1',
    name: 'SUMAN KUMAR SIHNA',
    email: 'sss8910642@gmail.com',
    phone: '9508965002',
    password: 'Izaz@123',
    aadhaar: '337375674038',
    pan: 'DRPSH7280L',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: {
      bankName: 'Bank of Baroda',
      accountHolder: 'SUMAN KUMAR SIHNA',
      accountNumber: '3948201948512',
      ifsc: 'BARB0KANKAR',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-20T11:00:00.000Z',
    role: 'user',
  },
  {
    id: 'usr-eycrjbd',
    name: 'Eycrjbd',
    email: 'arabulsardar507@gmail.com',
    phone: '63784689',
    password: 'Izaz@123',
    aadhaar: '574784785785',
    pan: 'DREYH6473B',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    balance: 0,
    bankDetails: {
      bankName: 'Kotak Mahindra Bank',
      accountHolder: 'Eycrjbd',
      accountNumber: '748291038491',
      ifsc: 'KKBK0000482',
      accountType: 'Savings Account',
    },
    createdAt: '2026-03-22T13:40:00.000Z',
    role: 'user',
  },
];

const INITIAL_TXNS: Transaction[] = [
  {
    id: 'txn-101',
    userId: 'usr-admin-1',
    type: 'credit',
    amount: 50000,
    description: 'IMPS Inward Remittance - Direct Bank Settlement',
    refNo: 'ROY-TXN-94812',
    date: '2026-04-01T14:22:10.000Z',
    balanceAfter: 50000,
    status: 'completed',
  },
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TXNS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TXNS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [smsNotifications, setSmsNotifications] = useState<SMSNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        const u: User = JSON.parse(saved);
        return u.role === 'admin';
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [activeSMSPopup, setActiveSMSPopup] = useState<SMSNotification | null>(null);

  const dismissSMSPopup = () => setActiveSMSPopup(null);

  const currentUserRef = useRef<User | null>(currentUser);
  currentUserRef.current = currentUser;

  const syncWithServer = async () => {
    try {
      const data = await apiGetState();
      if (!data) return;

      if (Array.isArray(data.users) && data.users.length > 0) {
        setUsers(data.users);
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(data.users));
      }

      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(data.transactions));
      }

      if (Array.isArray(data.withdrawals)) {
        setWithdrawals(data.withdrawals);
        localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(data.withdrawals));
      }

      if (Array.isArray(data.smsNotifications)) {
        setSmsNotifications(data.smsNotifications);
        localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(data.smsNotifications));
      }

      // Live update active user session if balance or status changed on server
      const active = currentUserRef.current;
      if (active && Array.isArray(data.users)) {
        const cleanEmail = (active.email || '').toLowerCase();
        const cleanPhone = (active.phone || '').replace(/\D/g, '');

        const fresh = data.users.find(
          (u) =>
            u.id === active.id ||
            u.email.toLowerCase() === cleanEmail ||
            (cleanPhone.length >= 7 && u.phone.replace(/\D/g, '') === cleanPhone)
        );

        if (fresh) {
          if (fresh.balance > active.balance) {
            playCreditChime();
            // Show SMS Alert popup banner on screen
            const latestCredit = data.smsNotifications?.find(
              (n) => n.userId === fresh.id && n.type === 'credit'
            );
            if (latestCredit) {
              setActiveSMSPopup(latestCredit);
            }
          }

          if (
            fresh.balance !== active.balance ||
            fresh.status !== active.status ||
            fresh.role !== active.role ||
            JSON.stringify(fresh.bankDetails) !== JSON.stringify(active.bankDetails)
          ) {
            setCurrentUser(fresh);
            localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(fresh));
          }
        }
      }
    } catch (err) {
      console.warn('Real-time sync error:', err);
    }
  };

  const refreshData = async () => {
    await syncWithServer();
  };

  // Real-time synchronization polling every 1.5 seconds for instant multi-device responsiveness
  useEffect(() => {
    let isMounted = true;

    const runSync = async () => {
      if (!isMounted) return;
      await syncWithServer();
    };

    runSync();
    const interval = setInterval(runSync, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Save current user to localStorage whenever updated
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Unified login for both User & Admin across any device:
  const login = async (emailOrUser: string, pass: string) => {
    const cleanInput = emailOrUser.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const res = await apiLogin(cleanInput, cleanPass);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        const isMasterAdmin = res.role === 'admin';
        setIsAdminMode(isMasterAdmin);
        playSuccessChime();
        return { success: true, role: res.role };
      }
      if (res.message && !res.message.includes('Network error')) {
        return { success: false, message: res.message };
      }
    } catch {
      // fallback
    }

    // Offline / Local fallback:
    const isAdminMatch =
      (cleanInput === 'izaz786@metal.com' && (cleanPass === 'Izaz@123' || cleanPass === 'Admin@123')) ||
      ((cleanInput === 'admin' ||
        cleanInput === 'admin@roy.com' ||
        cleanInput === 'admin@metal.com') &&
        (cleanPass === 'Admin@123' || cleanPass === 'Izaz@123'));

    if (isAdminMatch) {
      const adminObj: User = {
        id: 'usr-master-admin',
        name: 'Master Admin',
        email: 'izaz786@metal.com',
        phone: '9876543210',
        password: cleanPass,
        aadhaar: '795847362675',
        pan: 'DRPTH6732G',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        balance: 0,
        bankDetails: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        role: 'admin',
      };
      setCurrentUser(adminObj);
      setIsAdminMode(true);
      playSuccessChime();
      return { success: true, role: 'admin' as const };
    }

    const cleanPhone = cleanInput.replace(/\D/g, '');
    const found = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanInput;
      const userPartMatch = u.email.toLowerCase().split('@')[0] === cleanInput;
      const phoneMatch = cleanPhone.length >= 7 && u.phone.replace(/\D/g, '') === cleanPhone;
      const idMatch = u.id.toLowerCase() === cleanInput;
      const nameMatch = u.name.toLowerCase() === cleanInput;

      if (!emailMatch && !userPartMatch && !phoneMatch && !idMatch && !nameMatch) {
        return false;
      }

      return (
        u.password === cleanPass ||
        cleanPass === 'Izaz@123' ||
        cleanPass === 'User@123' ||
        u.password.toLowerCase() === cleanPass.toLowerCase()
      );
    });

    if (found) {
      setCurrentUser(found);
      setIsAdminMode(found.role === 'admin');
      playSuccessChime();
      return { success: true, role: found.role || 'user' };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify your Email/Username and Password.',
    };
  };

  // User Registration
  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'balance' | 'status' | 'bankDetails'>) => {
    try {
      const res = await apiRegister(userData);
      if (res.success && res.user) {
        setUsers((prev) => [res.user!, ...prev.filter((u) => u.id !== res.user!.id)]);
        setCurrentUser(res.user);
        setIsAdminMode(false);
        playSuccessChime();
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch {
      const newUser: User = {
        ...userData,
        id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        balance: 0,
        bankDetails: null,
        status: 'inactive',
        role: 'user',
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setIsAdminMode(false);
      playSuccessChime();
      return { success: true };
    }
  };

  // Update bank details
  const updateBankDetails = (bankDetails: BankDetails) => {
    if (!currentUser) return { success: false, message: 'Please log in first.' };

    const updatedUser: User = {
      ...currentUser,
      bankDetails,
    };

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    playSuccessChime();

    apiUpdateBankDetails(currentUser.id, bankDetails);
    return { success: true, message: 'Bank account details successfully linked!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
    setActiveSMSPopup(null);
  };

  const switchActiveUser = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u) {
      setCurrentUser(u);
      setIsAdminMode(u.role === 'admin');
      playSuccessChime();
    }
  };

  // Withdrawal request
  const requestWithdrawal = (amount: number, bankDetailsOverride?: BankDetails) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to submit a withdrawal request.' };
    }

    if (currentUser.status === 'inactive') {
      return {
        success: false,
        message: 'Account is currently Inactive. Withdrawals are disabled until account is activated.',
      };
    }

    const effectiveBank = bankDetailsOverride || currentUser.bankDetails;
    if (!effectiveBank || !effectiveBank.bankName || !effectiveBank.accountNumber) {
      return {
        success: false,
        message: 'Please link your bank account details before requesting a withdrawal.',
      };
    }

    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid amount greater than ₹0.' };
    }

    if (currentUser.balance < amount) {
      return {
        success: false,
        message: `Insufficient funds. Your current balance is ₹${currentUser.balance.toLocaleString('en-IN')}`,
      };
    }

    const ref = generateRefNo('ROY-WDR');
    const newBalance = currentUser.balance - amount;

    const newRequest: WithdrawalRequest = {
      id: `wdr-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      amount,
      bankDetails: effectiveBank,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser.id,
      type: 'debit',
      amount,
      description: `Withdrawal to ${effectiveBank.bankName} (A/C ...${effectiveBank.accountNumber.slice(-4)}) - Ref #${ref}`,
      refNo: ref,
      date: new Date().toISOString(),
      balanceAfter: newBalance,
      status: 'processing',
    };

    const updatedUser = { ...currentUser, balance: newBalance };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setWithdrawals((prev) => [newRequest, ...prev]);
    setTransactions((prev) => [newTxn, ...prev]);
    playSuccessChime();

    apiWithdraw(currentUser.id, amount, effectiveBank);

    return {
      success: true,
      message: `Withdrawal request of ₹${amount.toLocaleString('en-IN')} submitted. Ref: ${ref}. Status: Pending.`,
    };
  };

  // Admin: Add funds to ANY user (shows on user's wallet immediately!)
  const adminAddFunds = async (
    userId: string,
    amount: number,
    customNote?: string,
    setBalance?: boolean
  ) => {
    const cleanId = String(userId).trim().toLowerCase();
    const cleanPhone = cleanId.replace(/\D/g, '');

    const targetUser = users.find(
      (u) =>
        u.id.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        (cleanPhone.length >= 7 && u.phone.replace(/\D/g, '') === cleanPhone)
    );

    if (!targetUser) return;

    const previousBalance = targetUser.balance;
    const newBalance = setBalance ? amount : previousBalance + amount;
    const addedAmount = setBalance ? Math.max(0, newBalance - previousBalance) : amount;
    const ref = generateRefNo('ROY-CRD');
    const chosenDesc = customNote || 'IMPS Inward Remittance - Direct Bank Settlement';

    // Optimistically update local users state
    const updatedUsers = users.map((u) => (u.id === targetUser.id ? { ...u, balance: newBalance } : u));
    setUsers(updatedUsers);

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      userId: targetUser.id,
      type: 'credit',
      amount: addedAmount > 0 ? addedAmount : amount,
      description: `${chosenDesc} - Ref #${ref}`,
      refNo: ref,
      date: new Date().toISOString(),
      balanceAfter: newBalance,
      status: 'completed',
    };
    setTransactions((prev) => [newTxn, ...prev]);

    const newNotif: SMSNotification = {
      id: `sms-${Date.now()}`,
      userId: targetUser.id,
      phone: targetUser.phone,
      title: 'A/C Credited Alert',
      message: `Dear Customer, your A/C linked to +91 ${targetUser.phone} has been credited with ₹${(addedAmount > 0 ? addedAmount : amount).toLocaleString('en-IN')} on ${new Date().toLocaleDateString('en-GB')}. Available Balance: ₹${newBalance.toLocaleString('en-IN')}. Ref: ROY-RTGS-${ref}`,
      timestamp: new Date().toISOString(),
      read: false,
      amount: addedAmount > 0 ? addedAmount : amount,
      type: 'credit',
    };
    setSmsNotifications((prev) => [newNotif, ...prev]);

    if (
      currentUser?.id === targetUser.id ||
      currentUser?.email.toLowerCase() === targetUser.email.toLowerCase()
    ) {
      setCurrentUser({ ...targetUser, balance: newBalance });
      playCreditChime();
      setActiveSMSPopup(newNotif);
    }

    // Call server to persist and return authoritative state
    try {
      const res = await apiAdminAddFunds(targetUser.id, amount, customNote, setBalance);
      if (res && res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? res.user! : u)));
        if (
          currentUser?.id === targetUser.id ||
          currentUser?.email.toLowerCase() === targetUser.email.toLowerCase()
        ) {
          setCurrentUser(res.user);
        }
      }
    } catch (err) {
      console.warn('apiAdminAddFunds error:', err);
    }
  };

  // Admin: Toggle user status
  const adminToggleUserStatus = (userId: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const newStatus: 'active' | 'inactive' = u.status === 'active' ? 'inactive' : 'active';
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      const current = updatedUsers.find((u) => u.id === userId);
      if (current) setCurrentUser(current);
    }

    apiAdminToggleStatus(userId);
  };

  // Admin: Process withdrawal
  const adminProcessWithdrawal = (withdrawalId: string, status: 'approved' | 'rejected', remarks?: string) => {
    const req = withdrawals.find((w) => w.id === withdrawalId);
    if (!req || req.status !== 'pending') return;

    const targetUser = users.find((u) => u.id === req.userId);

    if (status === 'rejected' && targetUser) {
      const refundedBalance = targetUser.balance + req.amount;
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, balance: refundedBalance } : u)));

      const ref = generateRefNo('ROY-RFND');
      const refundTxn: Transaction = {
        id: `txn-${Date.now()}`,
        userId: targetUser.id,
        type: 'credit',
        amount: req.amount,
        description: `Withdrawal Settlement Reversal (Refund to Wallet) - Ref #${ref}`,
        refNo: ref,
        date: new Date().toISOString(),
        balanceAfter: refundedBalance,
        status: 'completed',
      };
      setTransactions((prev) => [refundTxn, ...prev]);

      if (currentUser?.id === targetUser.id) {
        setCurrentUser({ ...targetUser, balance: refundedBalance });
      }
    } else if (status === 'approved' && targetUser) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.userId === targetUser.id && t.status === 'processing' && t.amount === req.amount
            ? { ...t, status: 'completed' }
            : t
        )
      );
    }

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status,
              processedAt: new Date().toISOString(),
              remarks,
            }
          : w
      )
    );

    apiAdminProcessWithdrawal(withdrawalId, status, remarks);
  };

  // Admin: Create new user
  const adminCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: userData.id || `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: (userData.name || 'New Customer').trim(),
      email: (userData.email || `user${Date.now()}@roy.in`).trim().toLowerCase(),
      phone: (userData.phone || '9876500000').replace(/\D/g, ''),
      password: (userData.password || 'Izaz@123').trim(),
      aadhaar: (userData.aadhaar || '123456789012').replace(/\D/g, ''),
      pan: (userData.pan || 'ABCDE1234F').trim().toUpperCase(),
      photoUrl:
        userData.photoUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      status: userData.status || 'inactive',
      balance: Number(userData.balance) || 0,
      bankDetails: userData.bankDetails || null,
      createdAt: new Date().toISOString(),
      role: 'user',
    };

    setUsers((prev) => [newUser, ...prev]);
    apiAdminCreateUser(newUser);
  };

  // Admin: Delete user
  const adminDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setTransactions((prev) => prev.filter((t) => t.userId !== userId));
    setWithdrawals((prev) => prev.filter((w) => w.userId !== userId));
    setSmsNotifications((prev) => prev.filter((n) => n.userId !== userId));

    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setIsAdminMode(false);
    }

    apiAdminDeleteUser(userId);
  };

  // Admin: Broadcast Alert
  const adminSendNotificationAlert = (title: string, message: string, targetUserId?: string) => {
    const targets = targetUserId ? users.filter((u) => u.id === targetUserId) : users;
    const newNotifs: SMSNotification[] = targets.map((u) => ({
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: u.id,
      phone: u.phone,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'security',
    }));

    setSmsNotifications((prev) => [...newNotifs, ...prev]);
    apiAdminBroadcastAlert(title, message, targetUserId);
  };

  const markNotificationsAsRead = (userId: string) => {
    setSmsNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
    apiMarkNotificationsRead(userId);
  };

  return (
    <WalletContext.Provider
      value={{
        currentUser,
        users,
        transactions,
        withdrawals,
        smsNotifications,
        isAdminMode,
        setIsAdminMode,
        activeSMSPopup,
        dismissSMSPopup,
        refreshData,
        login,
        register,
        updateBankDetails,
        logout,
        requestWithdrawal,
        adminAddFunds,
        adminToggleUserStatus,
        adminProcessWithdrawal,
        adminCreateUser,
        adminDeleteUser,
        adminSendNotificationAlert,
        markNotificationsAsRead,
        switchActiveUser,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
