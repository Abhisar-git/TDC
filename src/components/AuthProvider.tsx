'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Heart, Lock, User, LogOut, Eye, EyeOff } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem('tdc_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('tdc_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Please use admin / admin.');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tdc_authenticated');
    setUsername('');
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-warm-bg">
        <div className="flex flex-col items-center space-y-4">
          <Heart className="h-12 w-12 animate-pulse text-primary" />
          <span className="text-sm font-medium text-primary/60 font-display">TDC Portal Loading...</span>
        </div>
      </div>
    );
  }

  // 1. Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-primary-dark via-primary to-primary-light p-4 md:p-8">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          
          {/* Brand Header */}
          <div className="bg-gradient-to-b from-primary/10 to-transparent px-8 pt-8 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-8 w-8 fill-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">TDC</h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark mt-1 font-display">
              The Date Crew • Matchmaker Portal
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary/40">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., admin"
                    className="w-full rounded-xl border border-primary/20 bg-warm-bg/50 py-3 pl-10 pr-4 text-sm text-warm-text outline-none transition-all placeholder:text-warm-text/30 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary/40">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-primary/20 bg-warm-bg/50 py-3 pl-10 pr-10 text-sm text-warm-text outline-none transition-all placeholder:text-warm-text/30 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-3.5 text-sm font-semibold tracking-wide text-white hover-gold-glow cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Sign In
              </button>

              {/* Autocomplete helper */}
              <div className="rounded-xl border border-dashed border-gold/40 bg-gold/5 p-4 text-center">
                <span className="text-[11px] text-gold-dark font-medium font-display uppercase tracking-wider">
                  Quick Access Credentials
                </span>
                <div className="mt-2 flex justify-center space-x-4 text-xs">
                  <span className="text-warm-text/60">
                    User: <strong className="text-primary-light">admin</strong>
                  </span>
                  <span className="text-warm-text/60">
                    Pass: <strong className="text-primary-light">admin</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin');
                  }}
                  className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Auto-fill & Bypass
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Application UI with header
  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      <div className="flex min-h-screen flex-col bg-warm-bg text-warm-text">
        
        {/* Unified Top Navigation */}
        <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md">
                <Heart className="h-5 w-5 fill-white animate-pulse" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-primary">TDC</span>
                <span className="ml-2 rounded bg-gold/25 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-gold-dark">
                  Matchmaker Hub
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 rounded-lg border border-primary/10 px-3 py-2 text-xs font-semibold text-primary/70 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-primary/10 bg-white/50 py-6 text-center text-xs text-warm-text/40 font-display">
          © {new Date().getFullYear()} TDC (The Date Crew) • Matchmaker Portal MVP • Confidentially Secured
        </footer>
      </div>
    </AuthContext.Provider>
  );
}
