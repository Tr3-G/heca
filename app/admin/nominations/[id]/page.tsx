'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import Skeleton from 'react-loading-skeleton';
import {
  ArrowLeft,
  Award,
  AlertCircle,
  Save,
  Trash2,
  CheckCircle2,
  Loader2,
  Clock,
  User,
  Building,
} from 'lucide-react';

const CATEGORIES = [
  'African Woman of the Year',
  'Lifetime Achievement Award',
  'Excellence in Public Service & Governance',
  'Trailblazer in Business & Industry',
  'Innovator in Science, Technology & AI',
  'Changemaker in Healthcare & Wellness',
  'Champion of Education & Human Capital',
  'Leader in Agriculture, Food Security & Sustainability',
  'Icon of Arts, Culture & Creative Economy',
  'Advocate for Social Justice, Inclusion & Human Rights',
  'Rising Star / Young Female Leader (Under 35)',
  'Excellence in Media, Journalism & Storytelling',
  'Pioneer in Energy, Mining & Infrastructure',
  'Leader in Banking, Finance & FinTech',
  'Outstanding Female Founder & Entrepreneur',
  'Corporate Gender Champion of the Year (Organisation)',
];

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

export default function EditNominationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [nomination, setNomination] = useState<Nomination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form states
  const [nomineeName, setNomineeName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [organisation, setOrganisation] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [biography, setBiography] = useState('');
  const [achievements, setAchievements] = useState('');
  const [impact, setImpact] = useState('');
  const [reasons, setReasons] = useState('');
  const [supporting, setSupporting] = useState('');
  const [nominatorName, setNominatorName] = useState('');
  const [nominatorEmail, setNominatorEmail] = useState('');
  const [nominatorPhone, setNominatorPhone] = useState('');
  const [status, setStatus] = useState('Pending Review');
  const [notes, setNotes] = useState('');

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveSuccessModal, setSaveSuccessModal] = useState(false);
  const [formError, setFormError] = useState('');

  // Deleting state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem('heca_token') || '';
    fetch(`/api/nominations/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Nomination not found or access denied.');
        return res.json();
      })
      .then((data) => {
        const nom = data.nomination;
        if (!nom) throw new Error('Nomination data is empty.');
        setNomination(nom);
        setNomineeName(nom.nomineeName || '');
        setCategory(nom.category || CATEGORIES[0]);
        setOrganisation(nom.organisation || '');
        setNomineeEmail(nom.nomineeEmail || '');
        setNomineePhone(nom.nomineePhone || '');
        setBiography(nom.biography || '');
        setAchievements(nom.achievements || '');
        setImpact(nom.impact || '');
        setReasons(nom.reasons || '');
        setSupporting(nom.supporting || '');
        setNominatorName(nom.nominatorName || '');
        setNominatorEmail(nom.nominatorEmail || '');
        setNominatorPhone(nom.nominatorPhone || '');
        setStatus(nom.status || 'Pending Review');
        setNotes(nom.notes || '');
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nomineeName.trim()) {
      setFormError('Nominee name is required.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/nominations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nomineeName: nomineeName.trim(),
          category: category.trim(),
          organisation: organisation.trim(),
          nomineeEmail: nomineeEmail.trim(),
          nomineePhone: nomineePhone.trim(),
          biography: biography.trim(),
          achievements: achievements.trim(),
          impact: impact.trim(),
          reasons: reasons.trim(),
          supporting: supporting.trim(),
          nominatorName: nominatorName.trim(),
          nominatorEmail: nominatorEmail.trim(),
          nominatorPhone: nominatorPhone.trim(),
          status,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update nomination.');
      }

      setNomination((prev) => (prev ? { ...prev, nomineeName, category, status, organisation } : null));
      setSaveSuccessModal(true);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/nominations/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete nomination.');
      }

      setShowDeleteModal(false);
      setDeleteSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
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
              <span className="rule"></span>ADMINISTRATION &middot; NOMINATIONS &middot; REVIEW &amp; EDIT
            </div>
            <h1>Nominee Assessment &amp; Status</h1>
            <p>Review candidate dossier, adjust jury status, and record internal editorial committee notes.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Back link & Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <Link
                href="/admin/nominations"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--plum-950)',
                }}
              >
                <ArrowLeft size={16} /> Back to All Nominations
              </Link>

              {nomination && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={15} /> Delete Nominee
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ maxWidth: '920px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '12px' }}>
                <Skeleton height={32} width="50%" style={{ marginBottom: '16px' }} />
                <Skeleton height={150} style={{ marginBottom: '20px' }} />
                <Skeleton height={300} />
              </div>
            ) : loadError ? (
              <div
                style={{
                  maxWidth: '920px',
                  margin: '0 auto',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '32px',
                  textAlign: 'center',
                  color: '#991b1b',
                }}
              >
                <AlertCircle size={36} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 8px' }}>{loadError}</h3>
                <Link href="/admin/nominations" className="btn btn-gold" style={{ marginTop: '16px', display: 'inline-block' }}>
                  Return to Nominations List
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '12px',
                  padding: '36px',
                  boxShadow: '0 4px 20px rgba(43,15,38,0.05)',
                  maxWidth: '920px',
                  margin: '0 auto',
                }}
              >
                {/* Header Profile Badge */}
                <div
                  style={{
                    background: '#faf9f6',
                    border: '1px solid #eeebe4',
                    borderRadius: '8px',
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '28px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Nomination ID: #{nomination?.id} &middot; Received {nomination?.createdAt?.slice(0, 10) || 'Recently'}
                    </span>
                    <h2 style={{ margin: '3px 0 0', fontSize: '20px', color: 'var(--plum-950)', fontWeight: 700 }}>
                      {nomination?.nomineeName}
                    </h2>
                    <div style={{ fontSize: '13.5px', color: '#666', marginTop: '2px' }}>
                      {nomination?.category} &middot; {nomination?.organisation || 'Independent'}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        background:
                          status === 'Approved'
                            ? '#dcfce7'
                            : status === 'Shortlisted'
                            ? '#e0e7ff'
                            : status === 'Under Review'
                            ? '#fef9c3'
                            : status === 'Declined'
                            ? '#fee2e2'
                            : '#f3f4f6',
                        color:
                          status === 'Approved'
                            ? '#166534'
                            : status === 'Shortlisted'
                            ? '#3730a3'
                            : status === 'Under Review'
                            ? '#854d0e'
                            : status === 'Declined'
                            ? '#991b1b'
                            : '#374151',
                      }}
                    >
                      Current: {status}
                    </span>
                  </div>
                </div>

                {formError && (
                  <div
                    style={{
                      padding: '14px 18px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#991b1b',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                    }}
                  >
                    <AlertCircle size={18} /> {formError}
                  </div>
                )}

                <form onSubmit={handleSave}>
                  {/* Status Selection Highlight */}
                  <div
                    style={{
                      background: '#fffdf5',
                      border: '1px solid var(--gold-500)',
                      borderRadius: '8px',
                      padding: '18px 20px',
                      marginBottom: '28px',
                    }}
                  >
                    <label htmlFor="editStatus" style={{ fontWeight: 700, color: 'var(--plum-950)', display: 'block', marginBottom: '6px', fontSize: '15px' }}>
                      Update Review / Jury Decision Status
                    </label>
                    <select
                      id="editStatus"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: '360px',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid #dcd8d0',
                        fontSize: '14.5px',
                        fontWeight: 600,
                        color: 'var(--plum-950)',
                        background: '#fff',
                      }}
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>

                  {/* Nominee Name & Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="field">
                      <label htmlFor="editNomName" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Nominee Full Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="editNomName"
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="editCategory" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Award Category <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select
                        id="editCategory"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px', background: '#fff' }}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Organisation, Email, Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="field">
                      <label htmlFor="editOrg" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Organisation &amp; Title
                      </label>
                      <input
                        type="text"
                        id="editOrg"
                        value={organisation}
                        onChange={(e) => setOrganisation(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="editNomEmail" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Nominee Email
                      </label>
                      <input
                        type="email"
                        id="editNomEmail"
                        value={nomineeEmail}
                        onChange={(e) => setNomineeEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="editNomPhone" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Nominee Phone
                      </label>
                      <input
                        type="tel"
                        id="editNomPhone"
                        value={nomineePhone}
                        onChange={(e) => setNomineePhone(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="field" style={{ marginBottom: '20px' }}>
                    <label htmlFor="editBio" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Biography &amp; Background
                    </label>
                    <textarea
                      id="editBio"
                      rows={4}
                      value={biography}
                      onChange={(e) => setBiography(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>

                  {/* Achievements & Impact */}
                  <div className="field" style={{ marginBottom: '20px' }}>
                    <label htmlFor="editAchievements" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Key Achievements &amp; Measurable Impact
                    </label>
                    <textarea
                      id="editAchievements"
                      rows={4}
                      value={achievements}
                      onChange={(e) => setAchievements(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>

                  {/* Reasons */}
                  <div className="field" style={{ marginBottom: '20px' }}>
                    <label htmlFor="editReasons" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Reason for Nomination
                    </label>
                    <textarea
                      id="editReasons"
                      rows={3}
                      value={reasons}
                      onChange={(e) => setReasons(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>

                  {/* Supporting Links */}
                  <div className="field" style={{ marginBottom: '24px' }}>
                    <label htmlFor="editSupporting" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Supporting Links &amp; Evidence
                    </label>
                    <input
                      type="text"
                      id="editSupporting"
                      value={supporting}
                      onChange={(e) => setSupporting(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>

                  {/* Internal Admin / Jury Review Notes */}
                  <div className="field" style={{ marginBottom: '28px' }}>
                    <label htmlFor="editNotes" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Internal Jury &amp; Secretariat Review Notes
                    </label>
                    <textarea
                      id="editNotes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add internal remarks, vetting comments, or scoring notes..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: '1px solid #dcd8d0',
                        fontSize: '14px',
                        background: '#faf9f6',
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
                    <Link
                      href="/admin/nominations"
                      style={{
                        padding: '12px 20px',
                        borderRadius: '6px',
                        border: '1px solid #dcd8d0',
                        background: '#f4f3f0',
                        color: '#555',
                        fontSize: '14.5px',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      className="btn btn-gold"
                      disabled={saving}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 28px',
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Save Success Modal */}
      <ActionModal
        isOpen={saveSuccessModal}
        type="success"
        title="Nomination Updated Successfully!"
        message={`The file for "${nomineeName}" has been updated and the status set to "${status}".`}
        confirmLabel="Stay on Page"
        cancelLabel="Back to Nominations"
        onConfirm={() => setSaveSuccessModal(false)}
        onClose={() => router.push('/admin/nominations')}
      />

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        type="confirm"
        isDangerous={true}
        loading={deleting}
        title="Delete Nomination Entry?"
        message={`Are you sure you want to permanently delete the candidacy of "${nomineeName}"?`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Keep Nomination"
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setShowDeleteModal(false);
        }}
      />

      {/* Delete Success Modal */}
      <ActionModal
        isOpen={deleteSuccessModal}
        type="success"
        title="Nomination Deleted"
        message="The nomination has been permanently removed from the system."
        confirmLabel="Return to Nominations"
        onConfirm={() => router.push('/admin/nominations')}
        onClose={() => router.push('/admin/nominations')}
      />

      <Footer />
    </>
  );
}
