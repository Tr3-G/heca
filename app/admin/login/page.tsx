'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ActionModal from '@/components/ActionModal';
import { KeyRound, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successUser, setSuccessUser] = useState<string>('');

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already authenticated via cookie or token, redirect directly to /admin
  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/admin');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      if (data.token) {
        localStorage.setItem('heca_token', data.token);
      }

      setSuccessUser(data.user?.name || 'Administrator');
      setShowSuccessModal(true);

      // Smooth redirect
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1200);
    } catch (err: any) {
      setLoginError(err.message);
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail.trim()) {
      setForgotMsg({ text: 'Please enter your registered staff email address.', isError: true });
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process password reset.');
      }

      setForgotMsg({ text: data.message, isError: false });
      setLoginEmail(forgotEmail);
    } catch (err: any) {
      setForgotMsg({ text: err.message, isError: true });
    } finally {
      setForgotLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="var(--gold-500)" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '80vh', background: 'var(--ivory)' }}>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>PORTAL &middot; HER EXCELLENCE CONFERENCE &amp; AWARDS 2027
            </div>
            <h1>Staff &amp; Admin Sign In</h1>
            <p>Access the editorial and awards management dashboard.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
          <div className="wrap">
            <div
              style={{
                maxWidth: '480px',
                margin: '0 auto',
                background: '#fff',
                border: '1px solid var(--gold-500)',
                borderRadius: '12px',
                padding: '36px',
                boxShadow: '0 8px 30px rgba(43,15,38,0.06)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(200,160,77,0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--plum-950)',
                    marginBottom: '12px',
                  }}
                >
                  <KeyRound size={28} />
                </div>
                <h2 style={{ fontSize: '24px', margin: 0 }}>Portal Authentication</h2>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '6px' }}>
                  Sign in with your authorized staff credentials
                </p>
              </div>

              {/* Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '24px',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setLoginError('');
                    setLoginSuccess('');
                  }}
                  style={{
                    padding: '8px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: authView === 'login' ? '2px solid var(--gold-500)' : 'none',
                    fontWeight: authView === 'login' ? 600 : 400,
                    color: authView === 'login' ? 'var(--plum-950)' : '#777',
                    cursor: 'pointer',
                    fontSize: '14.5px',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('forgot');
                    setForgotMsg(null);
                  }}
                  style={{
                    padding: '8px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: authView === 'forgot' ? '2px solid var(--gold-500)' : 'none',
                    fontWeight: authView === 'forgot' ? 600 : 400,
                    color: authView === 'forgot' ? 'var(--plum-950)' : '#777',
                    cursor: 'pointer',
                    fontSize: '14.5px',
                  }}
                >
                  Reset Password
                </button>
              </div>

              {/* VIEW 1: SIGN IN */}
              {authView === 'login' && (
                <form onSubmit={handleLogin}>
                  <div className="field" style={{ marginBottom: '16px' }}>
                    <label htmlFor="loginEmail">Email / Username</label>
                    <input
                      type="text"
                      id="loginEmail"
                      placeholder="admin@heca.ng"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div className="field" style={{ marginBottom: '20px' }}>
                    <label htmlFor="loginPassword">Password</label>
                    <input
                      type="password"
                      id="loginPassword"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                  </div>

                  {loginError && (
                    <div
                      style={{
                        color: '#dc2626',
                        fontSize: '13.5px',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AlertCircle size={16} /> {loginError}
                    </div>
                  )}
                  {loginSuccess && (
                    <div
                      style={{
                        color: '#16a34a',
                        fontSize: '13.5px',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={16} /> {loginSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={loginLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {loginLoading && <Loader2 size={18} className="animate-spin" />}
                    {loginLoading ? 'Authenticating...' : 'Sign In \u2192'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--plum-800)',
                        fontSize: '13px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Forgot your password? Reset with phone number
                    </button>
                  </div>
                </form>
              )}

              {/* VIEW 2: FORGOT / RESET PASSWORD */}
              {authView === 'forgot' && (
                <form onSubmit={handleForgotPassword}>
                  <div
                    style={{
                      background: '#fefce8',
                      border: '1px solid #fef08a',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      fontSize: '13.5px',
                      color: '#713f12',
                      marginBottom: '18px',
                      lineHeight: 1.5,
                    }}
                  >
                    When you submit, the system will temporarily set your password to be your registered phone number.
                  </div>

                  <div className="field" style={{ marginBottom: '18px' }}>
                    <label htmlFor="forgotEmail">Staff Email</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      placeholder="admin@heca.ng"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                  </div>

                  {forgotMsg && (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13.5px',
                        marginBottom: '16px',
                        background: forgotMsg.isError ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${forgotMsg.isError ? '#f87171' : '#86efac'}`,
                        color: forgotMsg.isError ? '#991b1b' : '#166534',
                        lineHeight: 1.45,
                      }}
                    >
                      {forgotMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={forgotLoading}
                    style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}
                  >
                    {forgotLoading ? 'Resetting password...' : 'Reset Password to Phone Number'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--plum-800)',
                        fontSize: '13px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Login Success Modal */}
      <ActionModal
        isOpen={showSuccessModal}
        type="success"
        title="Sign In Successful"
        message={`Welcome back, ${successUser || 'Administrator'}! Redirecting you to the management dashboard...`}
        confirmLabel="Continue to Dashboard"
        onClose={() => {
          window.location.href = '/admin';
        }}
        onConfirm={() => {
          window.location.href = '/admin';
        }}
      />

      <Footer />
    </>
  );
}
