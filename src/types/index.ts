export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  accountType: 'Savings Account' | 'Current Account';
}

export interface User {
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

export interface Transaction {
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

export interface WithdrawalRequest {
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

export interface SMSNotification {
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
