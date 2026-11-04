'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import Skeleton from 'react-loading-skeleton';
import {
  Award,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  CheckCircle,
  XCircle,
  User,
  AlertCircle,
} from 'lucide-react';

interface Nomination {
  id: string | number;
  nomineeName: string;
  nomineeEmail?: string;
  nomineePhone?: string;
  organisation?: string;
  category: string;
  biography?: string;
  achievements?: string;
  impact?: string;
  reasons?: string;
  supporting?: string;
  nominatorName: string;
  nominatorEmail?: string;
  nominatorPhone?: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export default function AdminNominationsListPage() {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Nomination | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadNominations = () => {
    setLoading(true);
    const token = localStorage.getItem('heca_token') || '';
    fetch('/api/nominations', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load nominations');
        return res.json();
      })
      .then((data) => {
        setNominations(data.nominations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNominations();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/nominations/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete nomination');
      }

      setNominations((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg(`Nomination for "${deleteTarget.nomineeName}" was deleted successfully.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Filter nominations
  const filteredNominations = nominations.filter((item) => {
    const matchesSearch =
      item.nomineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.organisation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nominatorName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(nominations.map((n) => n.category))).filter(Boolean);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'Shortlisted':
        return { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' };
      case 'Under Review':
        return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };
      case 'Declined':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; AWARDS &middot; NOMINATIONS
            </div>
            <h1>Awards &amp; Nominations Management</h1>
            <p>Review candidate profiles, assess jury recommendations, and record official nomination decisions.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Header with Title and Create Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--plum-950)', fontWeight: 700 }}>
                  Nomination Submissions ({nominations.length})
                </h2>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Filter by review status or award category to manage the shortlisting workflow.
                </p>
              </div>

              <Link
                href="/admin/nominations/create"
                className="btn btn-gold"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(200, 160, 77, 0.3)',
                }}
              >
                <PlusCircle size={18} /> Add New Nominee
              </Link>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e0ded9',
                borderRadius: '10px',
                padding: '18px',
                marginBottom: '24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  marginBottom: '14px',
                }}
              >
                {/* Search input */}
                <div
                  style={{
                    flex: '1 1 300px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#faf9f6',
                    border: '1px solid #dcd8d0',
                    borderRadius: '6px',
                    padding: '8px 14px',
                  }}
                >
                  <Search size={16} color="#888" />
                  <input
                    type="text"
                    placeholder="Search by nominee name, organisation, or nominator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13.5px' }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={15} color="#888" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dcd8d0',
                      background: '#fff',
                      fontSize: '13.5px',
                      color: 'var(--plum-950)',
                    }}
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Pills */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#666', marginRight: '4px' }}>Status:</span>
                {['ALL', 'Pending Review', 'Under Review', 'Approved', 'Shortlisted', 'Declined'].map((s) => {
                  const count =
                    s === 'ALL'
                      ? nominations.length
                      : nominations.filter((n) => n.status === s).length;
                  const isActive = statusFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isActive ? 'var(--plum-950)' : '#dcd8d0',
                        background: isActive ? 'var(--plum-950)' : '#fff',
                        color: isActive ? '#fff' : '#555',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nominations Table */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton height={70} />
                <Skeleton height={70} />
                <Skeleton height={70} />
              </div>
            ) : error ? (
              <div
                style={{
                  padding: '24px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <AlertCircle size={20} /> {error}
              </div>
            ) : filteredNominations.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0ded9',
                  borderRadius: '10px',
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <Award size={42} color="var(--gold-500)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px', color: 'var(--plum-950)' }}>
                  {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                    ? 'No matching nominations found'
                    : 'No nominations submitted yet'}
                </h3>
                <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
                  {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                    ? 'Try adjusting your search terms or filters.'
                    : 'Click below to register your first nominee.'}
                </p>
                <Link href="/admin/nominations/create" className="btn btn-gold" style={{ padding: '10px 20px' }}>
                  Register Nominee
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(43,15,38,0.04)',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#faf9f6', borderBottom: '1px solid #e8e6e1', fontSize: '13px', color: '#555' }}>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Nominee</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Award Category</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Nominator</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Review Status</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNominations.map((nom) => {
                        const badge = getStatusBadgeStyle(nom.status);
                        return (
                          <tr
                            key={nom.id}
                            style={{
                              borderBottom: '1px solid #f0eee9',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            {/* Nominee */}
                            <td style={{ padding: '16px 18px' }}>
                              <Link
                                href={`/admin/nominations/${nom.id}`}
                                style={{
                                  fontSize: '15px',
                                  fontWeight: 600,
                                  color: 'var(--plum-950)',
                                  display: 'block',
                                  marginBottom: '3px',
                                }}
                              >
                                {nom.nomineeName}
                              </Link>
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {nom.organisation || 'Independent Candidate'}
                              </div>
                            </td>

                            {/* Category */}
                            <td style={{ padding: '16px 18px', fontSize: '13.5px', color: '#444' }}>
                              <span
                                style={{
                                  background: '#faf9f6',
                                  border: '1px solid #e8e6e1',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  display: 'inline-block',
                                  fontWeight: 500,
                                }}
                              >
                                {nom.category}
                              </span>
                            </td>

                            {/* Nominator */}
                            <td style={{ padding: '16px 18px', fontSize: '13.5px', color: '#555' }}>
                              <div>{nom.nominatorName}</div>
                              {nom.nominatorEmail && (
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                  {nom.nominatorEmail}
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td style={{ padding: '16px 18px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                }}
                              >
                                {nom.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Link
                                  href={`/admin/nominations/${nom.id}`}
                                  className="btn btn-gold"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Edit size={14} /> View / Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(nom)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px 12px',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                  }}
                                  title="Delete Nomination"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={Boolean(deleteTarget)}
        type="confirm"
        isDangerous={true}
        loading={deleting}
        title="Delete Nomination Submission?"
        message={`Are you sure you want to permanently delete the nomination for "${deleteTarget?.nomineeName}" (${deleteTarget?.category})?`}
        confirmLabel="Yes, Delete Nomination"
        cancelLabel="Keep Nomination"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      {/* Action Success Modal */}
      <ActionModal
        isOpen={Boolean(successMsg)}
        type="success"
        title="Action Completed"
        message={successMsg}
        confirmLabel="Dismiss"
        onConfirm={() => setSuccessMsg('')}
        onClose={() => setSuccessMsg('')}
      />

      <Footer />
    </>
  );
}
