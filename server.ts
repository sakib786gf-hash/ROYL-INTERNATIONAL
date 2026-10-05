import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  accountType: 'Savings Account' | 'Current Account';
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  aadhaar: string;
  pan: string;
  photoUrl: string;
  status: 'active' | 'inactive';
  balance: number;
  bankDetails?: BankDetails | null;
  createdAt: string;
  role?: 'user' | 'admin';
}

interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  refNo: string;
  date: string;
  balanceAfter: number;
  status: 'completed' | 'processing' | 'rejected';
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  bankDetails: BankDetails;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  remarks?: string;
}

interface SMSNotification {
  id: string;
  userId: string;
  phone: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  amount?: number;
  type: 'credit' | 'withdrawal_update' | 'security';
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  smsNotifications: SMSNotification[];
}

const DB_DIR = path.resolve('data');
const DB_FILE = path.resolve(DB_DIR, 'roy_wallet_db.json');

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

let db: DatabaseSchema = {
  users: INITIAL_USERS,
  transactions: INITIAL_TXNS,
  withdrawals: [],
  smsNotifications: [],
};

// Database persistence helpers
function loadDatabase() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users)) {
        db = {
          users: parsed.users,
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_TXNS,
          withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
          smsNotifications: Array.isArray(parsed.smsNotifications) ? parsed.smsNotifications : [],
        };
        // Ensure master admin always exists
        const hasAdmin = db.users.some(
          (u) => u.email.toLowerCase() === 'izaz786@metal.com' || u.role === 'admin'
        );
        if (!hasAdmin) {
          db.users.unshift(INITIAL_USERS[0]);
        }
        return;
      }
    }
    saveDatabase();
  } catch (err) {
    console.warn('Could not load database, using defaults:', err);
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

function generateRefNo(prefix = 'ROY-TXN') {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

loadDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// CORS & Headers for robust mobile and desktop access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// ======================== API ROUTES ========================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    usersCount: db.users.length,
    txnsCount: db.transactions.length,
    serverTime: new Date().toISOString(),
  });
});

// 2. Full State for universal real-time multi-device sync
app.get('/api/state', (_req: Request, res: Response) => {
  res.json({
    users: db.users,
    transactions: db.transactions,
    withdrawals: db.withdrawals,
    smsNotifications: db.smsNotifications,
  });
});

// 3. Universal Login across ANY phone/device
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body || {};
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (!cleanId || !cleanPass) {
    res.status(400).json({ success: false, message: 'Please enter your Username/Email and Password.' });
    return;
  }

  // A) Admin check
  const isAdminMatch =
    (cleanId === 'izaz786@metal.com' && (cleanPass === 'Izaz@123' || cleanPass === 'Admin@123')) ||
    ((cleanId === 'admin' ||
      cleanId === 'admin@roy.com' ||
      cleanId === 'admin@metal.com') &&
      (cleanPass === 'Admin@123' || cleanPass === 'Izaz@123'));

  if (isAdminMatch) {
    let adminUser = db.users.find(
      (u) => u.email.toLowerCase() === 'izaz786@metal.com' || u.role === 'admin'
    );
    if (!adminUser) {
      adminUser = INITIAL_USERS[0];
      db.users.unshift(adminUser);
      saveDatabase();
    }
    res.json({ success: true, user: adminUser, role: 'admin' });
    return;
  }

  // B) Match against all created users
  const cleanPhoneDigits = cleanId.replace(/\D/g, '');
  const foundUser = db.users.find((u) => {
    const emailMatch = u.email.toLowerCase() === cleanId;
    const userPrefixMatch = u.email.toLowerCase().split('@')[0] === cleanId;
    const phoneMatch = cleanPhoneDigits.length >= 7 && u.phone.replace(/\D/g, '') === cleanPhoneDigits;
    const idMatch = u.id.toLowerCase() === cleanId;
    const nameMatch = u.name.toLowerCase() === cleanId;

    if (!emailMatch && !userPrefixMatch && !phoneMatch && !idMatch && !nameMatch) {
      return false;
    }

    // Password verification: user's password OR Izaz@123 / User@123 fallback
    return (
      u.password === cleanPass ||
      cleanPass === 'Izaz@123' ||
      cleanPass === 'User@123' ||
      u.password.toLowerCase() === cleanPass.toLowerCase()
    );
  });

  if (foundUser) {
    res.json({
      success: true,
      user: foundUser,
      role: foundUser.role || 'user',
    });
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Invalid credentials. Please verify your Email/Username and Password.',
  });
});

// 4. Registration on ANY phone -> Immediately available on ALL devices
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, phone, email, password, aadhaar, pan, photoUrl } = req.body || {};

  if (!name || !phone || !email || !password || !aadhaar || !pan) {
    res.status(400).json({ success: false, message: 'Please provide all identity and registration fields.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPhone = String(phone).replace(/\D/g, '');

  const existing = db.users.find(
    (u) => u.email.toLowerCase() === cleanEmail || (cleanPhone.length >= 8 && u.phone.replace(/\D/g, '') === cleanPhone)
  );

  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this Email or Phone is already registered.' });
    return;
  }

  const newUser: User = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: String(password).trim(),
    aadhaar: String(aadhaar).replace(/\D/g, ''),
    pan: String(pan).trim().toUpperCase(),
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    status: 'inactive', // Starts inactive as per customer specification
    balance: 0,
    bankDetails: null,
    createdAt: new Date().toISOString(),
    role: 'user',
  };

  db.users.unshift(newUser);
  saveDatabase();

  res.json({ success: true, user: newUser });
});

// 5. Update Bank Details
app.post('/api/bank-details', (req: Request, res: Response) => {
  const { userId, bankDetails } = req.body || {};
  if (!userId || !bankDetails) {
    res.status(400).json({ success: false, message: 'Missing userId or bankDetails' });
    return;
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  user.bankDetails = bankDetails;
  saveDatabase();

  res.json({ success: true, user });
});

// 6. Request Withdrawal
app.post('/api/withdraw', (req: Request, res: Response) => {
  const { userId, amount, bankDetails } = req.body || {};
  const numAmount = Number(amount);

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (user.status === 'inactive') {
    res.status(403).json({
      success: false,
      message: 'Account is currently Inactive. Withdrawals are disabled until account is activated.',
    });
    return;
  }

  if (!numAmount || numAmount <= 0) {
    res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    return;
  }

  if (user.balance < numAmount) {
    res.status(400).json({
      success: false,
      message: `Insufficient funds. Your current balance is ₹${user.balance.toLocaleString('en-IN')}`,
    });
    return;
  }

  const effectiveBank = bankDetails || user.bankDetails;
  if (!effectiveBank || !effectiveBank.bankName || !effectiveBank.accountNumber) {
    res.status(400).json({ success: false, message: 'Please provide valid bank details for withdrawal' });
    return;
  }

  // Deduct balance
  user.balance -= numAmount;

  const withdrawalId = `wdr-${Date.now()}`;
  const ref = generateRefNo('ROY-WDR');

  const newWithdrawal: WithdrawalRequest = {
    id: withdrawalId,
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    amount: numAmount,
    bankDetails: effectiveBank,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  const newTxn: Transaction = {
    id: `txn-${Date.now()}`,
    userId: user.id,
    type: 'debit',
    amount: numAmount,
    description: `Withdrawal to ${effectiveBank.bankName} (A/C ...${effectiveBank.accountNumber.slice(-4)}) - Ref #${ref}`,
    refNo: ref,
    date: new Date().toISOString(),
    balanceAfter: user.balance,
    status: 'processing',
  };

  const newNotif: SMSNotification = {
    id: `sms-${Date.now()}`,
    userId: user.id,
    phone: user.phone,
    title: 'Withdrawal Initiated',
    message: `Dear Customer, withdrawal request of ₹${numAmount.toLocaleString('en-IN')} to ${effectiveBank.bankName} (A/C ...${effectiveBank.accountNumber.slice(-4)}) has been initiated. Ref: ${ref}. Status: In Process.`,
    timestamp: new Date().toISOString(),
    read: false,
    amount: numAmount,
    type: 'withdrawal_update',
  };

  db.withdrawals.unshift(newWithdrawal);
  db.transactions.unshift(newTxn);
  db.smsNotifications.unshift(newNotif);
  saveDatabase();

  res.json({
    success: true,
    user,
    withdrawal: newWithdrawal,
    transaction: newTxn,
  });
});

// 7. Admin Add Unlimited Funds to ANY User
app.post('/api/admin/funds', (req: Request, res: Response) => {
  const { userId, amount, description } = req.body || {};
  const numAmount = Number(amount);

  if (!userId || !numAmount || numAmount <= 0) {
    res.status(400).json({ success: false, message: 'Invalid userId or amount' });
    return;
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'Target user not found' });
    return;
  }

  user.balance += numAmount;
  const ref = generateRefNo('ROY-CRD');

  const chosenDesc =
    description && description.trim()
      ? description.trim()
      : 'IMPS Inward Remittance - Direct Bank Settlement';

  const newTxn: Transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    userId: user.id,
    type: 'credit',
    amount: numAmount,
    description: `${chosenDesc} - Ref #${ref}`,
    refNo: ref,
    date: new Date().toISOString(),
    balanceAfter: user.balance,
    status: 'completed',
  };

  const newNotif: SMSNotification = {
    id: `sms-${Date.now()}`,
    userId: user.id,
    phone: user.phone,
    title: 'A/C Credited Alert',
    message: `Dear Customer, your A/C linked to +91 ${user.phone} has been credited with ₹${numAmount.toLocaleString('en-IN')} on ${new Date().toLocaleDateString('en-GB')}. Available Balance: ₹${user.balance.toLocaleString('en-IN')}. Ref: ROY-RTGS-${ref}`,
    timestamp: new Date().toISOString(),
    read: false,
    amount: numAmount,
    type: 'credit',
  };

  db.transactions.unshift(newTxn);
  db.smsNotifications.unshift(newNotif);
  saveDatabase();

  res.json({
    success: true,
    user,
    transaction: newTxn,
    notification: newNotif,
  });
});

// 8. Admin Toggle User Active / Inactive Status
app.post('/api/admin/toggle-status', (req: Request, res: Response) => {
  const { userId } = req.body || {};
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  user.status = user.status === 'active' ? 'inactive' : 'active';
  saveDatabase();

  res.json({ success: true, user });
});

// 9. Admin Process Withdrawal (Approve or Reject with refund)
app.post('/api/admin/process-withdrawal', (req: Request, res: Response) => {
  const { withdrawalId, status, remarks } = req.body || {};
  const wdr = db.withdrawals.find((w) => w.id === withdrawalId);
  if (!wdr || wdr.status !== 'pending') {
    res.status(400).json({ success: false, message: 'Pending withdrawal not found' });
    return;
  }

  const user = db.users.find((u) => u.id === wdr.userId);
  wdr.status = status;
  wdr.processedAt = new Date().toISOString();
  wdr.remarks = remarks;

  if (status === 'rejected' && user) {
    user.balance += wdr.amount;
    const ref = generateRefNo('ROY-RFND');
    const refundTxn: Transaction = {
      id: `txn-${Date.now()}`,
      userId: user.id,
      type: 'credit',
      amount: wdr.amount,
      description: `Withdrawal Settlement Reversal (Refund to Wallet) - Ref #${ref}`,
      refNo: ref,
      date: new Date().toISOString(),
      balanceAfter: user.balance,
      status: 'completed',
    };
    db.transactions.unshift(refundTxn);
  } else if (status === 'approved' && user) {
    const txn = db.transactions.find(
      (t) => t.userId === user.id && t.status === 'processing' && t.amount === wdr.amount
    );
    if (txn) {
      txn.status = 'completed';
    }
  }

  saveDatabase();
  res.json({ success: true, withdrawal: wdr, user });
});

// 10. Admin Creates User ID for Any Device to Login
app.post('/api/admin/create-user', (req: Request, res: Response) => {
  const userData = req.body || {};

  const cleanEmail = (userData.email || `user${Date.now()}@roy.in`).trim().toLowerCase();
  const cleanPhone = (userData.phone || '9876500000').replace(/\D/g, '');

  const newUser: User = {
    id: userData.id || `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: (userData.name || 'New Customer').trim(),
    email: cleanEmail,
    phone: cleanPhone,
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

  db.users.unshift(newUser);
  saveDatabase();

  res.json({ success: true, user: newUser });
});

// 11. Admin Delete User
app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  db.users = db.users.filter((u) => u.id !== userId);
  db.transactions = db.transactions.filter((t) => t.userId !== userId);
  db.withdrawals = db.withdrawals.filter((w) => w.userId !== userId);
  db.smsNotifications = db.smsNotifications.filter((n) => n.userId !== userId);
  saveDatabase();

  res.json({ success: true });
});

// 12. Admin Broadcast Alert
app.post('/api/admin/broadcast-alert', (req: Request, res: Response) => {
  const { title, message, targetUserId } = req.body || {};
  if (!title || !message) {
    res.status(400).json({ success: false, message: 'Missing title or message' });
    return;
  }

  const targets = targetUserId ? db.users.filter((u) => u.id === targetUserId) : db.users;
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

  db.smsNotifications = [...newNotifs, ...db.smsNotifications];
  saveDatabase();

  res.json({ success: true, count: newNotifs.length });
});

// 13. Mark Notifications As Read
app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const { userId } = req.body || {};
  if (userId) {
    db.smsNotifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveDatabase();
  }
  res.json({ success: true });
});

// ======================== SERVER BOOTSTRAP ========================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    // Vite middleware mode in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ROY INTERNATIONAL server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Server failed to start:', err);
  process.exit(1);
});
