'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import {
  ArrowLeft,
  Award,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle2,
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

export default function CreateNominationPage() {
  const router = useRouter();

  // Nominee Details
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

  // Nominator Details
  const [nominatorName, setNominatorName] = useState('HECA Secretariat');
  const [nominatorEmail, setNominatorEmail] = useState('awards@heca.ng');
  const [nominatorPhone, setNominatorPhone] = useState('+234 800 4322 000');

  // Status
  const [status, setStatus] = useState('Pending Review');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nomineeName.trim()) {
      setFormError('Nominee full name is required.');
      return;
    }
    if (!category.trim()) {
      setFormError('Please select an award category.');
      return;
    }
    if (!nominatorName.trim()) {
      setFormError('Nominator name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/nominations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('heca_token') || ''}`,
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
          nominatorName: nomominatorNameClean(),
          nominatorEmail: nominatorEmail.trim(),
          nominatorPhone: nominatorPhone.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record nomination.');
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  const nomominatorNameClean = () => nominatorName.trim() || 'HECA Secretariat';

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; NOMINATIONS &middot; CREATE
            </div>
            <h1>Register Award Nominee</h1>
            <p>Enter an official nomination entry on behalf of a nominator or the conference jury committee.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Back link */}
            <div style={{ marginBottom: '20px' }}>
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
            </div>

            {/* Main Form */}
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
              <div style={{ marginBottom: '28px', borderBottom: '1px solid #f0eee9', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--plum-950)', fontWeight: 700 }}>
                  Candidate Information
                </h2>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Complete the profile and rationale for this award candidacy.
                </p>
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

              <form onSubmit={handleSubmit}>
                {/* Nominee Name & Category 2-Column */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="field">
                    <label htmlFor="nomName" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Nominee Full Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nomName"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      placeholder="e.g. Dr. Ngozi Okonjo-Iweala"
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="nomCategory" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Award Category <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      id="nomCategory"
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

                {/* Organisation, Email, Phone 3-Column */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="field">
                    <label htmlFor="nomOrg" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Organisation &amp; Title
                    </label>
                    <input
                      type="text"
                      id="nomOrg"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      placeholder="e.g. World Trade Organization"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="nomEmail" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Nominee Email
                    </label>
                    <input
                      type="email"
                      id="nomEmail"
                      value={nomineeEmail}
                      onChange={(e) => setNomineeEmail(e.target.value)}
                      placeholder="nominee@example.org"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="nomPhone" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Nominee Phone
                    </label>
                    <input
                      type="tel"
                      id="nomPhone"
                      value={nomineePhone}
                      onChange={(e) => setNomineePhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* Biography */}
                <div className="field" style={{ marginBottom: '20px' }}>
                  <label htmlFor="nomBio" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Biography &amp; Background
                  </label>
                  <textarea
                    id="nomBio"
                    rows={4}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    placeholder="Brief career overview and notable leadership positions..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                  />
                </div>

                {/* Achievements & Impact */}
                <div className="field" style={{ marginBottom: '20px' }}>
                  <label htmlFor="nomAchievements" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Key Achievements &amp; Measurable Impact
                  </label>
                  <textarea
                    id="nomAchievements"
                    rows={4}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="What specific milestones, initiatives, or reforms demonstrate leadership?"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                  />
                </div>

                {/* Reasons / Justification */}
                <div className="field" style={{ marginBottom: '20px' }}>
                  <label htmlFor="nomReasons" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Reason for Nomination &amp; Jury Justification
                  </label>
                  <textarea
                    id="nomReasons"
                    rows={3}
                    value={reasons}
                    onChange={(e) => setReasons(e.target.value)}
                    placeholder="Why does this individual deserve the award this year?"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                  />
                </div>

                {/* Supporting Links */}
                <div className="field" style={{ marginBottom: '28px' }}>
                  <label htmlFor="nomSupporting" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Supporting Links &amp; References (Websites, Articles, Videos)
                  </label>
                  <input
                    type="text"
                    id="nomSupporting"
                    value={supporting}
                    onChange={(e) => setSupporting(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14px' }}
                  />
                </div>

                {/* Nominator Information Section */}
                <div
                  style={{
                    background: '#faf9f6',
                    border: '1px solid #eeebe4',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '28px',
                  }}
                >
                  <h4 style={{ margin: '0 0 14px', color: 'var(--plum-950)', fontSize: '16px', fontWeight: 600 }}>
                    Nominator Information &amp; Submission Origin
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label htmlFor="nominatorName" style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>
                        Nominator Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="nominatorName"
                        value={nominatorName}
                        onChange={(e) => setNominatorName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="nominatorEmail" style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>
                        Nominator Email
                      </label>
                      <input
                        type="email"
                        id="nominatorEmail"
                        value={nominatorEmail}
                        onChange={(e) => setNominatorEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="nominatorPhone" style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>
                        Nominator Phone
                      </label>
                      <input
                        type="tel"
                        id="nominatorPhone"
                        value={nominatorPhone}
                        onChange={(e) => setNominatorPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="field" style={{ marginBottom: '32px' }}>
                  <label htmlFor="initialStatus" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Initial Review Status
                  </label>
                  <select
                    id="initialStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid #dcd8d0',
                      fontSize: '14px',
                      background: '#fff',
                      display: 'block',
                    }}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Declined">Declined</option>
                  </select>
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
                    disabled={submitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Recording Nominee...
                      </>
                    ) : (
                      'Record Nominee'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Creation Success Modal */}
      <ActionModal
        isOpen={showSuccessModal}
        type="success"
        title="Nomination Recorded Successfully!"
        message={`The nomination for "${nomineeName}" under "${category}" has been registered in the awards portal.`}
        confirmLabel="Return to Nominations List"
        onConfirm={() => router.push('/admin/nominations')}
        onClose={() => router.push('/admin/nominations')}
      />

      <Footer />
    </>
  );
}
