'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import {
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export default function AdminChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword.trim()) {
      setError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setShowSuccessModal(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; ACCOUNT SECURITY
            </div>
            <h1>Change Account Password</h1>
            <p>Update your staff authentication credentials securely.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            <div
              style={{
                maxWidth: '540px',
                margin: '0 auto',
                background: '#fff',
                border: '1px solid var(--gold-500)',
                borderRadius: '12px',
                padding: '36px',
                boxShadow: '0 4px 20px rgba(43,15,38,0.05)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(200, 160, 77, 0.15)',
                    color: 'var(--gold-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <KeyRound size={26} />
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: 'var(--plum-950)', fontWeight: 700 }}>
                  Security &amp; Credentials
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Enter your current password (or temporary phone number) and choose a new password.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    marginBottom: '20px',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field" style={{ marginBottom: '18px' }}>
                  <label htmlFor="currentPassword" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                    Current Password / Temporary Phone Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                  />
                </div>

                <div className="field" style={{ marginBottom: '18px' }}>
                  <label htmlFor="newPassword" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                    New Password (min 6 characters) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                  />
                </div>

                <div className="field" style={{ marginBottom: '28px' }}>
                  <label htmlFor="confirmPassword" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                    Confirm New Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '15px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Success Modal */}
      <ActionModal
        isOpen={showSuccessModal}
        type="success"
        title="Password Changed Successfully!"
        message="Your account password has been updated. Please remember to use your new password for future sign-ins."
        confirmLabel="Continue to Overview"
        onConfirm={() => {
          setShowSuccessModal(false);
          window.location.href = '/admin';
        }}
        onClose={() => setShowSuccessModal(false)}
      />

      <Footer />
    </>
  );
}
