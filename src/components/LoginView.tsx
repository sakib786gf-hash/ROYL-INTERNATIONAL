import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  CreditCard,
  Upload,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatAadhaar, formatPAN } from '../utils/formatters';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
];

export const LoginView: React.FC = () => {
  const { login, register } = useWallet();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Single Universal Login Form (For both Users & Admin)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Registration Form State (NO bank account fields during registration!)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_AVATARS[0]);

  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter your Username/Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(loginIdentifier, loginPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.message || 'Invalid credentials. Please verify your Email/Username and Password.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!fullName || !phone || !aadhaar || !pan || !regEmail || !regPassword) {
      setRegError('Please fill in all identity and registration fields.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name: fullName,
      phone: phone.replace(/\D/g, ''),
      email: regEmail,
      password: regPassword,
      aadhaar: aadhaar.replace(/\D/g, ''),
      pan: pan.toUpperCase(),
      photoUrl,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setRegError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-indigo-600/30 to-cyan-500/20 border border-indigo-500/30 backdrop-blur-xl mb-4 shadow-xl shadow-indigo-950/60">
            <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-white to-cyan-300 bg-clip-text text-transparent font-mono uppercase">
            ROY INTERNATIONAL
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            Autonomous Digital Asset Ledger & Reserve Banking
          </p>
        </div>

        {/* Card Container */}
        <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 overflow-hidden">
          {/* Subtle Ambient Cosmic Light */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setLoginError('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setRegError('');
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SINGLE UNIVERSAL LOGIN FORM (For both User & Admin) */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  User ID / Email / Phone / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter User ID, Email, Phone, or Username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-cyan-500 hover:from-amber-600 hover:via-indigo-700 hover:to-cyan-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to ROY INTERNATIONAL</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  New member?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* USER REGISTRATION FORM (NO BANK DETAILS REQUIRED UPON REGISTRATION) */
            <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {regError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Photo Upload
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md"
                  />
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-slate-200 transition-colors">
                      <Upload className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Or avatar:</span>
                      {SAMPLE_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPhotoUrl(url)}
                          className={`h-6 w-6 rounded-full overflow-hidden border ${
                            photoUrl === url ? 'ring-2 ring-cyan-400 border-white' : 'border-slate-700'
                          }`}
                        >
                          <img src={url} alt={`Preset ${i}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number (for SMS Notifications)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Aadhaar Number & PAN Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={formatAadhaar(aadhaar)}
                    onChange={(e) => setAadhaar(e.target.value)}
                    placeholder="1234 5678 9012"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formatPAN(pan)}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Register Account</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
