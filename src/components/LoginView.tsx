import React, { useState } from 'react';
import { User } from '../types';
import { Eye, EyeOff, IdCard, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { KmrlLogo } from './KmrlLogo';
import { MetroSidePanel } from './MetroSidePanel';
import { SplashScreen } from './SplashScreen';

interface LoginViewProps {
  currentUser: User | null;
  users: User[];
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);


  const handleSplashComplete = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId.trim()) {
      setErrorMsg('Please enter your Employee ID or Email.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: employeeId.trim(),
          password: password.trim(),
        }),
      });

      let data: any = null;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (res.ok && data?.user) {
        onLoginSuccess(data.user, data.token || '');
      } else {
        const errorDetail =
          data?.message ||
          data?.error ||
          (text && !text.includes('<!DOCTYPE') && text.length < 200 ? text : null) ||
          (res.status === 404
            ? 'Authentication service endpoint not reachable (404). Service may be restarting.'
            : res.status >= 500
            ? `Server error (${res.status}). Please check network connectivity or retry.`
            : 'Invalid credentials. Please verify your Employee ID and password.');

        setErrorMsg(errorDetail);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to KMRL authentication service.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-foreground overflow-hidden">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left Side 3D Metro Scene (Visible on md and up) */}
        <div className="relative h-64 md:h-full w-full min-h-[280px] md:min-h-screen">
          <MetroSidePanel />
        </div>

        {/* Right Side Login Form */}
        <div className="relative flex h-full w-full items-center justify-center overflow-y-auto bg-background px-4 py-8 md:px-8 md:py-12">
          {/* subtle backdrop */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--accent),transparent_55%)]" />

          <div className="animate-fade-up relative z-10 w-full max-w-md rounded-3xl border border-white/40 bg-card/70 p-8 shadow-[0_24px_60px_-24px_rgba(30,58,138,0.35)] backdrop-blur-xl md:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <KmrlLogo className="items-center" markClassName="h-11" />
              <h1 className="mt-6 text-2xl font-semibold text-navy">Welcome Back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to access your workspace</p>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="employeeId" className="text-sm font-medium text-navy">
                  Official Email or Employee ID
                </label>
                <div className="group relative">
                  <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-royal" />
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    autoComplete="username"
                    placeholder="e.g. employee@kmrl.in"
                    className="h-12 w-full rounded-xl border border-input bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-royal focus:ring-4 focus:ring-royal/15"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-navy">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-royal" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-input bg-background/80 pl-11 pr-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-royal focus:ring-4 focus:ring-royal/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-royal"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
                >
                  <span
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-colors ${
                      remember ? 'border-royal bg-royal' : 'border-input bg-background'
                    }`}
                    aria-hidden="true"
                  >
                    {remember && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" fill="none">
                        <path
                          d="M2.5 6.2 5 8.5 9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  Remember me
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-medium text-royal transition-colors hover:text-navy cursor-pointer"
                >
                  Need assistance?
                </button>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="group mt-1 h-12 w-full rounded-xl bg-royal text-base font-semibold text-primary-foreground shadow-lg shadow-royal/25 transition-all hover:bg-navy hover:shadow-xl disabled:opacity-80 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4.5 w-4.5 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>

              {/* Demo Credentials Quick-Fill for instant one-click login */}
              <div className="mt-2 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-navy uppercase tracking-wider">
                    Demo Credentials
                  </span>
                  <span className="text-[11px] text-muted-foreground">Click to fill</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'Admin', id: 'KMRL-001', pass: 'Admin@123', label: 'Admin', sub: 'Director' },
                    { role: 'HR', id: 'KMRL-102', pass: 'HR@123', label: 'HR Dept', sub: 'Manager' },
                    { role: 'Employee', id: 'KMRL-10245', pass: 'Employee@123', label: 'Staff', sub: 'Operations' },
                  ].map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => {
                        setEmployeeId(demo.id);
                        setPassword(demo.pass);
                        setErrorMsg(null);
                      }}
                      className="flex flex-col items-start p-2 rounded-xl border border-border/80 bg-background/60 hover:bg-royal/10 hover:border-royal/50 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-navy group-hover:text-royal transition-colors">
                        {demo.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate w-full">
                        {demo.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Authorized personnel only. All access is monitored and logged.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy">Account Access Assistance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KMRL IDMS accounts are provisioned via administrative invitation. If you do not have your credentials or require a password reset, please reach out to the KMRL IT Administrator or Human Resources department.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForgotModal(false)}
              className="w-full text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};
