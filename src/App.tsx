import React from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { SpaceBackground } from './components/SpaceBackground';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';

const MainContent: React.FC = () => {
  const { currentUser, isAdminMode } = useWallet();

  const isShowingAdmin = currentUser?.role === 'admin' || isAdminMode;

  return (
    <div className="min-h-screen flex flex-col text-slate-100 relative selection:bg-emerald-500 selection:text-slate-950">
      <SpaceBackground />

      {!currentUser ? (
        <>
          <Navbar />
          <main className="flex-1">
            <LoginView />
          </main>
        </>
      ) : isShowingAdmin ? (
        <>
          <Navbar />
          <main className="flex-1">
            <AdminDashboard />
          </main>
        </>
      ) : (
        <main className="flex-1">
          <UserDashboard />
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}
