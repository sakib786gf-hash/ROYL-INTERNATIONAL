import { User, Transaction, WithdrawalRequest, SMSNotification, BankDetails } from '../types';

export interface AppState {
  users: User[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  smsNotifications: SMSNotification[];
}

export async function apiGetState(): Promise<AppState | null> {
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API getState error:', err);
    return null;
  }
}

export async function apiLogin(
  identifier: string,
  pass: string
): Promise<{ success: boolean; user?: User; role?: 'user' | 'admin'; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: pass }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API login error:', err);
    return {
      success: false,
      message: 'Network error connecting to ROY INTERNATIONAL server. Please try again.',
    };
  }
}

export async function apiRegister(
  userData: Omit<User, 'id' | 'createdAt' | 'balance' | 'status' | 'bankDetails'>
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API register error:', err);
    return {
      success: false,
      message: 'Network error connecting to ROY INTERNATIONAL server. Please try again.',
    };
  }
}

export async function apiUpdateBankDetails(
  userId: string,
  bankDetails: BankDetails
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetch('/api/bank-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, bankDetails }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API update bank details error:', err);
    return { success: false, message: 'Server communication error.' };
  }
}

export async function apiWithdraw(
  userId: string,
  amount: number,
  bankDetails?: BankDetails
): Promise<{
  success: boolean;
  user?: User;
  withdrawal?: WithdrawalRequest;
  transaction?: Transaction;
  message?: string;
}> {
  try {
    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, bankDetails }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API withdraw error:', err);
    return { success: false, message: 'Server communication error.' };
  }
}

export async function apiAdminAddFunds(
  userId: string,
  amount: number,
  description?: string
): Promise<{
  success: boolean;
  user?: User;
  transaction?: Transaction;
  notification?: SMSNotification;
  message?: string;
}> {
  try {
    const res = await fetch('/api/admin/funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, description }),
    });
    return await res.json();
  } catch (err) {
    console.warn('API admin funds error:', err);
    return { success: false, message: 'Server communication error.' };
  }
}

export async function apiAdminToggleStatus(
  userId: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetch('/api/admin/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  } catch (err) {
    console.warn('API admin toggle status error:', err);
    return { success: false, message: 'Server communication error.' };
  }
}

export async function apiAdminProcessWithdrawal(
  withdrawalId: string,
  status: 'approved' | 'rejected',
  remarks?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/admin/process-withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, status, remarks }),
    });
    return await res.json();
  } catch (err) {
    console.warn('API admin process withdrawal error:', err);
    return { success: false, message: 'Server communication error.' };
  }
}

export async function apiAdminCreateUser(
  userData: Partial<User>
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.warn('API admin create user error:', err);
    return { success: false, message: 'Server communication error.' };
  }
}

export async function apiAdminDeleteUser(userId: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err) {
    console.warn('API admin delete user error:', err);
    return { success: false };
  }
}

export async function apiAdminBroadcastAlert(
  title: string,
  message: string,
  targetUserId?: string
): Promise<{ success: boolean }> {
  try {
    const res = await fetch('/api/admin/broadcast-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, targetUserId }),
    });
    return await res.json();
  } catch (err) {
    console.warn('API admin broadcast alert error:', err);
    return { success: false };
  }
}

export async function apiMarkNotificationsRead(userId: string): Promise<void> {
  try {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch (err) {
    console.warn('API mark notifications read error:', err);
  }
}
