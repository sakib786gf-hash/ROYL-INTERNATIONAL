import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, WithdrawalRequest, SMSNotification, BankDetails } from '../types';
import { generateRefNo } from '../utils/formatters';
import { playCreditChime, playSuccessChime } from '../utils/audio';

interface WalletContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  smsNotifications: SMSNotification[];
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  login: (emailOrUser: string, pass: string) => { success: boolean; role?: 'user' | 'admin'; message?: string };
  register: (userData: Omit<User, 'id' | 'createdAt' | 'balance' | 'status' | 'bankDetails'>) => { success: boolean; message?: string };
  updateBankDetails: (bankDetails: BankDetails) => { success: boolean; message: string };
  logout: () => void;
  requestWithdrawal: (amount: number, bankDetails?: BankDetails) => { success: boolean; message: string };
  adminAddFunds: (userId: string, amount: number, customNote?: string) => void;
  adminToggleUserStatus: (userId: string) => void;
  adminProcessWithdrawal: (withdrawalId: string, status: 'approved' | 'rejected', remarks?: string) => void;
  adminCreateUser: (userData: Partial<User>) => void;
  adminDeleteUser: (userId: string) => void;
  adminSendNotificationAlert: (title: string, message: string, targetUserId?: string) => void;
  markNotificationsAsRead: (userId: string) => void;
  switchActiveUser: (userId: string) => void;
}

const STORAGE_USERS_KEY = 'roy_wallet_users_v4';
const STORAGE_TXNS_KEY = 'roy_wallet_txns_v4';
const STORAGE_WITHDRAWALS_KEY = 'roy_wallet_withdrawals_v4';
const STORAGE_NOTIFS_KEY = 'roy_wallet_notifs_v4';
const STORAGE_CURRENT_USER_KEY = 'roy_wallet_current_user_v4';

// Initial pre-populated data matching screenshot perfectly
const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Iran sardar',
    email: 'izazm728@gmail.com',
    phone: '6745385798',
    password: 'User@123',
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
    id: 'usr-sakib-1',
    name: 'Sakib Khan',
    email: 'sakib786gf@gmail.com',
    phone: '9876543210',
    password: 'User@123',
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
    id: 'usr-rahul-1',
    name: 'Rahul Varma',
    email: 'rahul.v@metal.in',
    phone: '9456789012',
    password: 'User@123',
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
    password: 'User@123',
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
    password: 'User@123',
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
    password: 'User@123',
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
    password: 'User@123',
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

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wdr-201',
    userId: 'usr-admin-1',
    userName: 'Iran sardar',
    userPhone: '6745385798',
    amount: 25000,
    bankDetails: {
      bankName: 'State Bank of India',
      accountHolder: 'Iran sardar',
      accountNumber: '482910394851',
      ifsc: 'SBIN0004821',
      accountType: 'Savings Account',
    },
    status: 'pending',
    requestedAt: '2026-04-02T16:45:00.000Z',
  },
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TXNS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TXNS;
    } catch {
      return INITIAL_TXNS;
    }
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  });

  const [smsNotifications, setSmsNotifications] = useState<SMSNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        return u?.role === 'admin';
      }
      return false;
    } catch {
      return false;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(smsNotifications));
  }, [smsNotifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Keep currentUser synced if user data updates in users array
  useEffect(() => {
    if (currentUser) {
      const updated = users.find((u) => u.id === currentUser.id);
      if (
        updated &&
        (updated.balance !== currentUser.balance ||
          updated.status !== currentUser.status ||
          JSON.stringify(updated.bankDetails) !== JSON.stringify(currentUser.bankDetails))
      ) {
        setCurrentUser(updated);
      }
    }
  }, [users]);

  // Unified login for both User & Admin:
  // "ইউজার এডমিন একই জায়গায় আইডি পাসওয়ার্ড দিয়ে লগইন করতে পারবে যদি ইউজারের আইডি পাসওয়ার্ড দিয়ে লগইন করলে ইউজার আইডি ওপেন হবে।
  //  এডমিন এর আইডি পাসওয়ার্ড দিয়ে লগইন করলে এডমিন ড্যাশবোর্ড ওপেন হবে।"
  const login = (emailOrUser: string, pass: string) => {
    const trimmed = emailOrUser.trim().toLowerCase();

    // Check if entered credentials match Admin (izaz786@metal.com / Izaz@123 or admin / Admin@123)
    const isAdminMatch =
      (trimmed === 'izaz786@metal.com' && pass === 'Izaz@123') ||
      ((trimmed === 'admin' ||
        trimmed === 'admin@roy.com' ||
        trimmed === 'admin@metal.com') &&
        (pass === 'Admin@123' || pass === 'Izaz@123'));

    if (isAdminMatch) {
      const adminObj: User = {
        id: 'usr-master-admin',
        name: 'Master Admin',
        email: 'izaz786@metal.com',
        phone: '9876543210',
        password: pass,
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

    // Check for matching user in user database
    const found = users.find(
      (u) =>
        (u.email.toLowerCase() === trimmed ||
          u.phone === trimmed ||
          u.id.toLowerCase() === trimmed) &&
        u.password === pass
    );

    if (found) {
      if (found.role === 'admin') {
        setCurrentUser(found);
        setIsAdminMode(true);
        playSuccessChime();
        return { success: true, role: 'admin' as const };
      }

      setCurrentUser(found);
      setIsAdminMode(false);
      playSuccessChime();
      return { success: true, role: 'user' as const };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify your Email/Username and Password.',
    };
  };

  // Registration:
  // "এখন খুললে ইনঅ্যাক্টিভ থাকবে। কে ওয়াই সি সাকসেসফুল এরকম নোটিফিকেশন লেখাতে হবে না বা কেওয়াইসি পেন্ডিং দেখাতে হবে না।"
  const register = (userData: Omit<User, 'id' | 'createdAt' | 'balance' | 'status' | 'bankDetails'>) => {
    const emailExists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'An account with this Email already exists.' };
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      balance: 0,
      bankDetails: null,
      status: 'inactive', // "এখন খুললে ইনঅ্যাক্টিভ থাকবে"
      role: 'user',
    };

    // User is immediately stored in `users` state so Admin sees them instantly!
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAdminMode(false);
    playSuccessChime();

    return { success: true };
  };

  const updateBankDetails = (bankDetails: BankDetails) => {
    if (!currentUser) return { success: false, message: 'Please log in first.' };

    const updatedUser: User = {
      ...currentUser,
      bankDetails,
    };

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    playSuccessChime();

    return { success: true, message: 'Bank account details successfully linked!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
  };

  const switchActiveUser = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u) {
      setCurrentUser(u);
      setIsAdminMode(u.role === 'admin');
      playSuccessChime();
    }
  };

  // User requests withdrawal
  const requestWithdrawal = (amount: number, bankDetailsOverride?: BankDetails) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to submit a withdrawal request.' };
    }

    // If account is inactive, user cannot withdraw!
    if (currentUser.status === 'inactive') {
      return {
        success: false,
        message: 'Account is currently Inactive. Withdrawals are disabled.',
      };
    }

    const bank = bankDetailsOverride || currentUser.bankDetails;
    if (!bank || !bank.bankName || !bank.accountNumber || !bank.ifsc) {
      return {
        success: false,
        message: 'Please link your Bank Account details first before submitting a withdrawal request.',
      };
    }

    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid withdrawal amount.' };
    }

    if (amount > currentUser.balance) {
      return { success: false, message: 'Insufficient wallet balance for this withdrawal request.' };
    }

    // Deduct from balance upfront to hold in escrow
    const newBalance = currentUser.balance - amount;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: newBalance, bankDetails: bank } : u))
    );
    setCurrentUser((prev) => (prev ? { ...prev, balance: newBalance, bankDetails: bank } : null));

    // Create withdrawal request
    const newRequest: WithdrawalRequest = {
      id: `wdr-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      amount,
      bankDetails: bank,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    setWithdrawals((prev) => [newRequest, ...prev]);

    // Create Transaction record (No mention of admin!)
    const ref = generateRefNo('ROY-WDR');
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser.id,
      type: 'debit',
      amount,
      description: `Bank Withdrawal - Payout to ${bank.bankName} (A/C ...${bank.accountNumber.slice(-4)})`,
      refNo: ref,
      date: new Date().toISOString(),
      balanceAfter: newBalance,
      status: 'processing',
    };
    setTransactions((prev) => [newTxn, ...prev]);

    playCreditChime();

    return {
      success: true,
      message: 'Withdrawal request submitted successfully! Funds are processing.',
    };
  };

  // Admin adds funds (UNLIMITED funds to any user's wallet)
  const adminAddFunds = (userId: string, amount: number, customNote?: string) => {
    if (amount <= 0) return;

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const newBalance = targetUser.balance + amount;

    // Update user balance
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: newBalance } : u))
    );

    const ref = generateRefNo('ROY-TXN');

    const cleanDescriptions = [
      'IMPS Inward Remittance - Direct Bank Settlement',
      'RTGS Central Clearing Credit - Automated Payout',
      'Electronic Funds Transfer (NEFT) Inward',
      'Direct Liquidity Credit - Reserve Settlement',
    ];
    const chosenDesc =
      customNote && customNote.trim().length > 0
        ? customNote
        : cleanDescriptions[Math.floor(Math.random() * cleanDescriptions.length)];

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      type: 'credit',
      amount,
      description: `${chosenDesc} - Ref #${ref}`,
      refNo: ref,
      date: new Date().toISOString(),
      balanceAfter: newBalance,
      status: 'completed',
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // Notification in the header notification bar (without pop-up)
    const formattedAmount = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedBal = `₹${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const notif: SMSNotification = {
      id: `sms-${Date.now()}`,
      userId,
      phone: targetUser.phone,
      title: 'A/C Credited',
      message: `Your account has been credited with ${formattedAmount} on ${todayStr} via IMPS. Available Balance: ${formattedBal}. Ref: ${ref}.`,
      timestamp: new Date().toISOString(),
      read: false,
      amount,
      type: 'credit',
    };
    setSmsNotifications((prev) => [notif, ...prev]);

    if (currentUser?.id === userId) {
      playCreditChime();
    }
  };

  const adminToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'inactive' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const adminProcessWithdrawal = (withdrawalId: string, status: 'approved' | 'rejected', remarks?: string) => {
    const req = withdrawals.find((w) => w.id === withdrawalId);
    if (!req || req.status !== 'pending') return;

    const targetUser = users.find((u) => u.id === req.userId);

    if (status === 'rejected' && targetUser) {
      const refundedBalance = targetUser.balance + req.amount;
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, balance: refundedBalance } : u))
      );

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

      const notif: SMSNotification = {
        id: `sms-${Date.now()}`,
        userId: targetUser.id,
        phone: targetUser.phone,
        title: 'Withdrawal Declined',
        message: `Your withdrawal request of ₹${req.amount.toLocaleString('en-IN')} has been declined. Amount credited back to wallet.`,
        timestamp: new Date().toISOString(),
        read: false,
        amount: req.amount,
        type: 'withdrawal_update',
      };
      setSmsNotifications((prev) => [notif, ...prev]);
    } else if (status === 'approved' && targetUser) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.userId === targetUser.id && t.status === 'processing' && t.amount === req.amount
            ? { ...t, status: 'completed' }
            : t
        )
      );

      const ref = generateRefNo('ROY-CMS');
      const notif: SMSNotification = {
        id: `sms-${Date.now()}`,
        userId: targetUser.id,
        phone: targetUser.phone,
        title: 'Withdrawal Dispatched',
        message: `Your withdrawal of ₹${req.amount.toLocaleString('en-IN')} to ${req.bankDetails.bankName} A/C ...${req.bankDetails.accountNumber.slice(-4)} has been dispatched. Ref: ${ref}.`,
        timestamp: new Date().toISOString(),
        read: false,
        amount: req.amount,
        type: 'withdrawal_update',
      };
      setSmsNotifications((prev) => [notif, ...prev]);
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
  };

  const adminCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name || 'New Customer',
      email: userData.email || `user${Date.now()}@roy.in`,
      phone: userData.phone || '9876500000',
      password: userData.password || 'User@123',
      aadhaar: userData.aadhaar || '123456789012',
      pan: userData.pan || 'ABCDE1234F',
      photoUrl:
        userData.photoUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      status: userData.status || 'inactive',
      balance: userData.balance || 0,
      bankDetails: userData.bankDetails || null,
      createdAt: new Date().toISOString(),
      role: 'user',
    };

    setUsers((prev) => [newUser, ...prev]);
  };

  const adminDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setTransactions((prev) => prev.filter((t) => t.userId !== userId));
    setWithdrawals((prev) => prev.filter((w) => w.userId !== userId));
    setSmsNotifications((prev) => prev.filter((n) => n.userId !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const adminSendNotificationAlert = (title: string, message: string, targetUserId?: string) => {
    const newNotifs: SMSNotification[] = (targetUserId ? users.filter((u) => u.id === targetUserId) : users).map(
      (u) => ({
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: u.id,
        phone: u.phone,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'security',
      })
    );

    setSmsNotifications((prev) => [...newNotifs, ...prev]);
    playSuccessChime();
  };

  const markNotificationsAsRead = (userId: string) => {
    setSmsNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
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
