'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function RsvpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState('yes');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in your name and email address.');
      return;
    }

    setSubmitted(true);

    // Also trigger mailto in background if desired
    const subject = `RSVP (Abuja Edition) — Her Excellence Conference & Awards 2027: ${fullName}`;
    const body =
      `HER EXCELLENCE CONFERENCE & AWARDS 2027 — ABUJA EDITION\n` +
      `Venue: Wells Carlton Hotel & Apartment Abuja\n` +
      `Date: Saturday, 20 March 2027\n\n` +
      `Name: ${fullName}\n` +
      `Email: ${email}\n` +
      `Attending: ${attending === 'yes' ? 'Yes, I will attend' : 'Regretfully, I am unable to attend'}\n`;

    const mailto = `mailto:asomultimediatv@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Optional fallback window opening
    window.location.href = mailto;
  };

  return (
    <>
      <Navbar />

      <main>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>HOME / RSVP &middot; ABUJA EDITION
            </div>
            <h1>RSVP for the Abuja Edition</h1>
            <p style={{ fontWeight: 500, color: 'var(--gold-400)', marginTop: '8px' }}>
              Saturday, 20 March 2027 &middot; Wells Carlton Hotel &amp; Apartment, Abuja
            </p>
            <p style={{ marginTop: '6px' }}>Theme: Women of Excellence: Leading Change, Creating Impact, Building Legacies</p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="rsvp-shell">
              <div className="rsvp-aside">
                <div>
                  <h2>
                    We'd love to<br />welcome you in Abuja.
                  </h2>
                  <p>
                    A quick RSVP helps us prepare reserved seating, guest protocol, catering, and materials for everyone
                    joining us on <strong>Saturday, 20th March 2027</strong> at the <strong>Wells Carlton Hotel &amp; Apartment Abuja</strong>.
                  </p>
                </div>
                <div className="rsvp-note">
                  Inquiries or table reservations? Contact the Secretariat at{' '}
                  <a href="mailto:asomultimediatv@gmail.com">asomultimediatv@gmail.com</a> or call{' '}
                  <strong>+234 806 955 2027</strong> / <strong>+234 803 679 8508</strong>.
                </div>
              </div>

              <form className="rsvp-form" id="rsvpForm" onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    autoComplete="name"
                    placeholder="e.g. Dr. Amina Bello"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Will you be attending in Abuja?</label>
                  <div className="attend-choice" role="radiogroup" aria-label="Will you be attending in Abuja?">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="attending"
                        value="yes"
                        checked={attending === 'yes'}
                        onChange={() => setAttending('yes')}
                      />
                      <span>Yes, I will attend in Abuja</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                      <input
                        type="radio"
                        name="attending"
                        value="no"
                        checked={attending === 'no'}
                        onChange={() => setAttending('no')}
                      />
                      <span>Regretfully, I am unable to attend</span>
                    </label>
                  </div>
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

                {submitted && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '10px',
                      padding: '18px',
                      color: '#166534',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>
                      <CheckCircle2 size={22} color="#16a34a" />
                      <span>RSVP Details Confirmed!</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                      Thank you, <strong>{fullName}</strong>. Opening your email client to notify the Secretariat at ASO MULTI MEDIA. We look forward to honouring women of excellence with you.
                    </p>
                  </div>
                )}

                <button type="submit" className="btn btn-gold form-submit">
                  Send RSVP confirmation
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
