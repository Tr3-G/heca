'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import Skeleton from 'react-loading-skeleton';
import {
  UserCheck,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

interface StaffUser {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add staff form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  const [addedStaffName, setAddedStaffName] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);

  const loadStaff = () => {
    setLoading(true);
    const token = localStorage.getItem('heca_token') || '';
    fetch('/api/staff', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load staff list');
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.staff || [];
        setStaffList(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create staff member.');
      }

      setAddedStaffName(name);
      setShowAddSuccessModal(true);

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRole('staff');

      // Reload list
      loadStaff();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/staff/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete staff member.');
      }

      setStaffList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; ACCESS &amp; TEAM
            </div>
            <h1>Staff &amp; Editorial Accounts</h1>
            <p>Manage portal access permissions, administrator accounts, and editorial secretariat credentials.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Two Column Layout: Current Staff Table & Add Staff Form */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
              {/* Left Column: Staff Members List */}
              <div>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid var(--gold-500)',
                    borderRadius: '10px',
                    padding: '24px',
                    boxShadow: '0 2px 10px rgba(43,15,38,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--plum-950)', fontWeight: 700 }}>
                        Active Staff Team ({staffList.length})
                      </h2>
                      <p style={{ margin: '2px 0 0', color: '#666', fontSize: '13px' }}>
                        Authorized users who can manage articles, nominees, and media.
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Skeleton height={60} />
                      <Skeleton height={60} />
                      <Skeleton height={60} />
                    </div>
                  ) : error ? (
                    <div
                      style={{
                        padding: '16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#991b1b',
                        fontSize: '13.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertCircle size={18} /> {error}
                    </div>
                  ) : staffList.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
                      No staff accounts found.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {staffList.map((member) => (
                        <div
                          key={member.id}
                          style={{
                            padding: '16px',
                            borderRadius: '8px',
                            background: '#faf9f6',
                            border: '1px solid #eeebe4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--plum-950)' }}>
                                {member.name}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: member.role === 'admin' ? 'rgba(200,160,77,0.2)' : '#e5e7eb',
                                  color: member.role === 'admin' ? 'var(--gold-700)' : '#4b5563',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {member.role}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '13px', color: '#666', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Mail size={13} color="var(--gold-600)" /> {member.email}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Phone size={13} color="var(--plum-800)" /> {member.phone}
                              </span>
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(member)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 10px',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                              title="Delete Staff Member"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Add New Staff Form */}
              <div>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid var(--gold-500)',
                    borderRadius: '10px',
                    padding: '28px',
                    boxShadow: '0 2px 10px rgba(43,15,38,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(200, 160, 77, 0.15)',
                        color: 'var(--gold-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserPlus size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--plum-950)', fontWeight: 700 }}>
                        Add New Staff Member
                      </h3>
                      <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                        Create credentials for a team member to sign in.
                      </p>
                    </div>
                  </div>

                  {formError && (
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#991b1b',
                        marginBottom: '18px',
                        fontSize: '13.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertCircle size={16} /> {formError}
                    </div>
                  )}

                  <form onSubmit={handleAddStaff}>
                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label htmlFor="staffName" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                        Full Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="staffName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Funke Adesanya"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                    </div>

                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label htmlFor="staffEmail" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                        Staff Email <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        id="staffEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@heca.ng"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                    </div>

                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label htmlFor="staffPhone" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                        Phone Number <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        id="staffPhone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#777' }}>
                        Note: Used as the temporary password if password reset is requested.
                      </p>
                    </div>

                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label htmlFor="staffPassword" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                        Initial Password <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="password"
                        id="staffPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                    </div>

                    <div className="field" style={{ marginBottom: '24px' }}>
                      <label htmlFor="staffRole" style={{ fontWeight: 600, color: 'var(--plum-950)', fontSize: '13.5px' }}>
                        Access Role
                      </label>
                      <select
                        id="staffRole"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #dcd8d0',
                          fontSize: '14px',
                          background: '#fff',
                        }}
                      >
                        <option value="staff">Staff / Editor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-gold"
                      disabled={submitting}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Creating Account...
                        </>
                      ) : (
                        'Create Staff Account'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Add Staff Success Modal */}
      <ActionModal
        isOpen={showAddSuccessModal}
        type="success"
        title="Staff Member Created!"
        message={`"${addedStaffName}" has been successfully added to the staff team. They can now log in using their email and initial password.`}
        confirmLabel="Continue"
        onConfirm={() => setShowAddSuccessModal(false)}
        onClose={() => setShowAddSuccessModal(false)}
      />

      {/* Delete Staff Confirm Modal */}
      <ActionModal
        isOpen={Boolean(deleteTarget)}
        type="confirm"
        isDangerous={true}
        loading={deleting}
        title="Remove Staff Account?"
        message={`Are you sure you want to remove "${deleteTarget?.name}" (${deleteTarget?.email}) from the staff team? They will lose access to the portal immediately.`}
        confirmLabel="Yes, Remove Staff"
        cancelLabel="Keep Account"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      {/* Delete Staff Success Modal */}
      <ActionModal
        isOpen={deleteSuccessModal}
        type="success"
        title="Staff Account Removed"
        message="The staff account has been deleted successfully."
        confirmLabel="Dismiss"
        onConfirm={() => setDeleteSuccessModal(false)}
        onClose={() => setDeleteSuccessModal(false)}
      />

      <Footer />
    </>
  );
}
