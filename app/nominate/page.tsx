'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function NominatePage() {
  const [formData, setFormData] = useState({
    nomineeName: '',
    nomineeEmail: '',
    nomineePhone: '',
    organisation: '',
    category: '',
    biography: '',
    achievements: '',
    impact: '',
    reasons: '',
    supporting: '',
    nominatorName: '',
    nominatorEmail: '',
    nominatorPhone: '',
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!formData.nomineeName.trim()) {
      setError('Please provide the nominee’s full name.');
      return;
    }
    if (!formData.category) {
      setError('Please select an award category.');
      return;
    }
    if (!formData.biography.trim() || !formData.achievements.trim()) {
      setError('Please provide the nominee’s biography and summary of achievements.');
      return;
    }
    if (!formData.nominatorName.trim() || !formData.nominatorEmail.trim()) {
      setError('Please provide your name and email as nominator.');
      return;
    }
    if (!formData.confirm) {
      setError('Please check the confirmation box before submitting.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccess(data.nomination);
      // Reset form
      setFormData({
        nomineeName: '',
        nomineeEmail: '',
        nomineePhone: '',
        organisation: '',
        category: '',
        biography: '',
        achievements: '',
        impact: '',
        reasons: '',
        supporting: '',
        nominatorName: '',
        nominatorEmail: '',
        nominatorPhone: '',
        confirm: false,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>HOME / NOMINATE &middot; HECA 50 WOMEN OF EXCELLENCE 2027
            </div>
            <h1>Nominate a Woman of Excellence today</h1>
            <p style={{ fontWeight: 500, color: 'var(--gold-400)', marginTop: '8px' }}>
              Nomination is now open &middot; Deadline: 30 January 2027
            </p>
            <p style={{ marginTop: '6px' }}>
              Do you know a woman who is leading change, breaking barriers, empowering others or building a legacy?
              Don&rsquo;t let her story go unnoticed. Nominate her for the HECA 50 Women of Excellence in Nigeria 2027
              recognition.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="nominate-intro">
              <div className="section-head" style={{ marginBottom: 0 }}>
                <h2>How to nominate</h2>
                <p style={{ marginTop: '18px', fontSize: '16.5px', color: '#4c3a48', maxWidth: '52ch' }}>
                  Nominating a deserving woman is an opportunity to help bring her achievements and contributions to
                  national recognition.
                </p>
                <p style={{ marginTop: '14px', fontSize: '16.5px', color: '#4c3a48', maxWidth: '52ch' }}>
                  To submit a nomination, complete the official HECA 2027 online nomination form below and provide the
                  information listed alongside.
                </p>
              </div>

              <div className="invite-card">
                <div className="invite-title">KEY DATES</div>
                <div className="invite-row">
                  <span className="k">DEADLINE</span>
                  <span className="v">
                    30 January 2027<small>Nominations close at the end of this day</small>
                  </span>
                </div>
                <div className="invite-row">
                  <span className="k">EVENT</span>
                  <span className="v">
                    Saturday, 20 March 2027<small>Abuja, Nigeria</small>
                  </span>
                </div>
                <div className="invite-row">
                  <span className="k">ORGANISER</span>
                  <span className="v">ASO MULTI MEDIA</span>
                </div>
              </div>
            </div>

            <div className="rsvp-shell nominate-shell">
              <div className="rsvp-aside">
                <div>
                  <h2>Tell us her story.</h2>
                  <p>
                    Please make sure everything you submit is accurate and that the nominee&rsquo;s achievements can be
                    reasonably verified.
                  </p>
                  <ul className="checklist">
                    <li>Full name and contact details of the nominee</li>
                    <li>Organisation, profession or specialisation</li>
                    <li>Award category</li>
                    <li>Biography and professional background</li>
                    <li>Major achievements and contributions</li>
                    <li>Evidence of impact, leadership or community service</li>
                    <li>Why she deserves recognition</li>
                    <li>Supporting documents, links or references</li>
                    <li>Your name and contact details as nominator</li>
                  </ul>
                </div>
                <div className="rsvp-note">
                  Questions about nominations? Contact the Secretariat at{' '}
                  <a href="mailto:asomultimediatv@gmail.com">asomultimediatv@gmail.com</a> or call{' '}
                  <strong>+234 806 955 2027</strong> / <strong>+234 803 679 8508</strong>.
                </div>
              </div>

              <form className="rsvp-form nominate-form" id="nominateForm" onSubmit={handleSubmit} noValidate>
                <fieldset className="form-group">
                  <legend>About the nominee</legend>
                  <div className="field">
                    <label htmlFor="nomineeName">Nominee&rsquo;s full name</label>
                    <input
                      type="text"
                      id="nomineeName"
                      name="nomineeName"
                      required
                      placeholder="e.g. Dr. Amina Bello"
                      value={formData.nomineeName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="nomineeEmail">Nominee&rsquo;s email</label>
                      <input
                        type="email"
                        id="nomineeEmail"
                        name="nomineeEmail"
                        placeholder="name@domain.com"
                        value={formData.nomineeEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="nomineePhone">Nominee&rsquo;s phone</label>
                      <input
                        type="tel"
                        id="nomineePhone"
                        name="nomineePhone"
                        placeholder="+234 ..."
                        value={formData.nomineePhone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="organisation">Organisation, profession or area of specialisation</label>
                    <input
                      type="text"
                      id="organisation"
                      name="organisation"
                      placeholder="e.g. Managing Director, Bello Health Foundation"
                      value={formData.organisation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="category">Award category</label>
                    <select id="category" name="category" required value={formData.category} onChange={handleChange}>
                      <option value="">Select a category</option>
                      <option>Leadership &amp; Governance</option>
                      <option>Government &amp; Public Service</option>
                      <option>Business &amp; Entrepreneurship</option>
                      <option>Banking &amp; Finance</option>
                      <option>Law &amp; Justice</option>
                      <option>Medicine &amp; Healthcare</option>
                      <option>Education &amp; Academia</option>
                      <option>Technology &amp; Innovation</option>
                      <option>Media &amp; Communications</option>
                      <option>Arts, Culture &amp; Fashion</option>
                      <option>Real Estate &amp; Infrastructure</option>
                      <option>Philanthropy &amp; Humanitarian Service</option>
                      <option>Agriculture &amp; Food Security</option>
                      <option>Social Entrepreneurship</option>
                      <option>Diplomacy &amp; International Development</option>
                    </select>
                  </div>
                </fieldset>

                <fieldset className="form-group">
                  <legend>Why she deserves recognition</legend>
                  <div className="field">
                    <label htmlFor="biography">Brief biography and professional background</label>
                    <textarea
                      id="biography"
                      name="biography"
                      rows={4}
                      required
                      value={formData.biography}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="achievements">Summary of major achievements and contributions</label>
                    <textarea
                      id="achievements"
                      name="achievements"
                      rows={4}
                      required
                      value={formData.achievements}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="impact">Evidence of impact, leadership or community service</label>
                    <textarea
                      id="impact"
                      name="impact"
                      rows={4}
                      required
                      value={formData.impact}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="reasons">Reasons the nominee deserves recognition</label>
                    <textarea
                      id="reasons"
                      name="reasons"
                      rows={4}
                      required
                      value={formData.reasons}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="supporting">
                      Supporting documents, links or references <span className="optional">(optional)</span>
                    </label>
                    <textarea
                      id="supporting"
                      name="supporting"
                      rows={3}
                      placeholder="Paste links to articles, profiles, reports or documents."
                      value={formData.supporting}
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>

                <fieldset className="form-group">
                  <legend>About you, the nominator</legend>
                  <div className="field">
                    <label htmlFor="nominatorName">Your full name</label>
                    <input
                      type="text"
                      id="nominatorName"
                      name="nominatorName"
                      required
                      value={formData.nominatorName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="nominatorEmail">Your email</label>
                      <input
                        type="email"
                        id="nominatorEmail"
                        name="nominatorEmail"
                        required
                        value={formData.nominatorEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="nominatorPhone">Your phone</label>
                      <input
                        type="tel"
                        id="nominatorPhone"
                        name="nominatorPhone"
                        required
                        value={formData.nominatorPhone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="field consent">
                  <input
                    type="checkbox"
                    id="confirm"
                    name="confirm"
                    required
                    checked={formData.confirm}
                    onChange={handleChange}
                  />
                  <label htmlFor="confirm">
                    I confirm that the information I have provided is accurate and that the nominee&rsquo;s achievements can be reasonably verified.
                  </label>
                </div>

                {error && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: '#fef2f2',
                      border: '1px solid #f87171',
                      borderRadius: '8px',
                      color: '#b91c1c',
                      fontSize: '14px',
                      marginBottom: '16px',
                    }}
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '10px',
                      padding: '20px',
                      color: '#166534',
                      marginBottom: '20px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>
                      <CheckCircle2 size={24} color="#16a34a" />
                      <span>Nomination Successfully Recorded!</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '14.5px', color: '#15803d', lineHeight: 1.5 }}>
                      Thank you! Your nomination for <strong>{success.nomineeName}</strong> ({success.category}) has been safely registered in the review progress database.
                    </p>
                    <div style={{ fontSize: '13px', background: '#dcfce7', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
                      Tracking Reference ID: <strong>{success.id}</strong>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-gold form-submit"
                  disabled={loading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Submitting to database...' : 'Submit nomination'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="cta-strip">
          <div className="wrap">
            <h2>Nominations close on 30 January 2027</h2>
            <a href="#nomineeName" className="btn btn-gold">
              Nominate a woman of excellence
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
