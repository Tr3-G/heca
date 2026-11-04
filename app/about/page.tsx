import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>HOME / ABOUT &middot; ABUJA EDITION
            </div>
            <h1>About the Abuja Edition</h1>
            <p style={{ fontWeight: 500, color: 'var(--gold-400)', marginTop: '8px', fontSize: '16px' }}>
              THEME: Women of Excellence: Leading Change, Creating Impact, Building Legacies
            </p>
            <p style={{ marginTop: '6px' }}>
              Saturday, 20th March 2027 &middot; Wells Carlton Hotel &amp; Apartment, Abuja, Nigeria
            </p>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="section">
          <div className="wrap about-grid">
            <div className="about-copy">
              <div className="section-head">
                <div className="kicker">
                  <span className="rule"></span>EXECUTIVE SUMMARY
                </div>
                <h2>A national platform for recognition, leadership, empowerment and legacy.</h2>
              </div>
              <p>
                The <strong>Her Excellence Conference &amp; Awards (HECA) 2027</strong> is a prestigious national
                platform created to celebrate, honour, and amplify the contributions of exceptional Nigerian women
                whose achievements, leadership, enterprise, creativity, service, and commitment to humanity are making
                a meaningful difference in Nigeria and beyond.
              </p>
              <p>
                As part of the national activities marking the <strong>International Women's Day 2027</strong> season,
                the <strong>Abuja Edition</strong> will be hosted on <strong>Saturday, 20th March 2027</strong> at the
                prestigious <strong>Wells Carlton Hotel &amp; Apartment Abuja</strong>. The Abuja edition focuses
                squarely on <em>Women, Leadership, Governance &amp; National Development</em>, convening distinguished
                women leaders, policymakers, public servants, entrepreneurs, diplomats, development partners,
                corporate leaders, and young changemakers from across the nation.
              </p>
              <p>
                Beyond the signature awards ceremony honouring 50 Outstanding Women of Excellence, HECA 2027 provides a
                platform for high-level conversations, networking, mentorship, and knowledge exchange — creating an
                enduring ecosystem in which accomplished women inspire and support the next generation.
              </p>
              <p className="about-signoff">Celebrating Excellence &middot; Inspiring Impact &middot; Building Legacies.</p>
            </div>

            <div className="invite-card">
              <div className="invite-title">ABUJA EVENT DETAILS</div>
              <div className="invite-row">
                <div className="k">EDITION</div>
                <div className="v">
                  2nd Edition<small>Abuja, Nigeria</small>
                </div>
              </div>
              <div className="invite-row">
                <div className="k">DATE</div>
                <div className="v">
                  Saturday, 20th March 2027<small>International Women's Day Celebration Season</small>
                </div>
              </div>
              <div className="invite-row">
                <div className="k">VENUE</div>
                <div className="v">
                  Wells Carlton Hotel &amp; Apartment<small>Asokoro / Abuja, Federal Capital Territory</small>
                </div>
              </div>
              <div className="invite-row">
                <div className="k">FOCUS</div>
                <div className="v">
                  Leadership, Governance &amp; National Dev.<small>High-level dialogues &amp; policy sessions</small>
                </div>
              </div>
              <div className="invite-row">
                <div className="k">ATTIRE</div>
                <div className="v">
                  Royal Purple &amp; Gold<small>Traditional or formal wear welcome</small>
                </div>
              </div>
              <Link href="/rsvp" className="btn btn-gold invite-cta">
                Reserve your seat in Abuja
              </Link>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="section" style={{ background: 'var(--ivory-dim)', paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="wrap">
            <div className="section-head center">
              <div className="kicker">
                <span className="rule"></span>OUR PURPOSE
              </div>
              <h2>Vision &amp; Mission</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '28px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  background: 'var(--ivory)',
                  border: '1px solid var(--gold-500)',
                  padding: '36px 30px',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: 'var(--gold-500)',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  Vision
                </div>
                <h3 style={{ fontSize: '22px', marginBottom: '14px', color: 'var(--plum-950)' }}>
                  Leading National Platform
                </h3>
                <p style={{ fontSize: '15.5px', color: '#4c3a48', lineHeight: 1.65 }}>
                  To establish Her Excellence Conference &amp; Awards as a leading national platform for recognising
                  outstanding Nigerian women, promoting women's leadership, and creating opportunities for the next
                  generation.
                </p>
              </div>
              <div
                style={{
                  background: 'var(--ivory)',
                  border: '1px solid var(--gold-500)',
                  padding: '36px 30px',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: 'var(--gold-500)',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  Mission
                </div>
                <h3 style={{ fontSize: '22px', marginBottom: '14px', color: 'var(--plum-950)' }}>
                  Celebrate, Connect &amp; Empower
                </h3>
                <p style={{ fontSize: '15.5px', color: '#4c3a48', lineHeight: 1.65 }}>
                  To identify, celebrate, connect and empower exceptional women while creating platforms for
                  knowledge sharing, mentorship, collaboration, and sustainable impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Programme / Highlights */}
        <section className="section" style={{ paddingTop: '80px' }}>
          <div className="wrap">
            <div className="section-head">
              <div className="kicker">
                <span className="rule"></span>PROPOSED HIGHLIGHTS &middot; ABUJA EDITION
              </div>
              <h2>How the Abuja gathering unfolds</h2>
            </div>
            <div className="agenda-list">
              <div className="agenda-item">
                <div className="agenda-time">MORNING</div>
                <h3>Red Carpet, Arrival &amp; Registration</h3>
                <p>Guests and dignitaries are received on the red carpet with photography and networking reception.</p>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">OPENING</div>
                <h3>Opening Ceremony &amp; Welcome Address</h3>
                <p>
                  Official commencement and keynote remarks framing the event theme:{' '}
                  <em>Women of Excellence: Leading Change, Creating Impact, Building Legacies</em>.
                </p>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">PLENARY</div>
                <h3>Women's Leadership Conference &amp; Keynote Address</h3>
                <p>A flagship address on leadership, enterprise, policy formulation, and breaking glass ceilings across Nigeria.</p>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">DIALOGUE</div>
                <h3>Women in Governance &amp; Public Service Sessions</h3>
                <p>High-level dialogues featuring female public servants, legislators, state executives, and policy experts on national development.</p>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">EMPOWERMENT</div>
                <h3>Entrepreneurship, Economic Empowerment &amp; Mentorship</h3>
                <p>Intergenerational conversation connecting accomplished female leaders with young emerging women in enterprise, technology, and governance.</p>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">AWARDS</div>
                <h3>Recognition of HECA 50 Honourees &amp; Special Awards</h3>
                <p>Signature national presentation honouring 50 Outstanding Women of Excellence in Nigeria across diverse sectors.</p>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">CELEBRATION</div>
                <h3>Networking Reception, Cultural Experience &amp; Group Photo</h3>
                <p>Banquet, cultural and entertainment performances, media interviews, and official photo sessions.</p>
              </div>
            </div>
            <p style={{ marginTop: '24px', fontSize: '13.5px', color: '#8a7686', fontStyle: 'italic' }}>
              Proposed master programme for the Abuja Edition &middot; Wells Carlton Hotel &amp; Apartment Abuja.
            </p>
          </div>
        </section>

        {/* 50 Honourees categories */}
        <section className="section" style={{ background: 'var(--ivory-dim)', paddingTop: '96px', paddingBottom: '96px' }}>
          <div className="wrap">
            <div className="section-head center">
              <div className="kicker">
                <span className="rule"></span>THE 2027 SIGNATURE RECOGNITION
              </div>
              <h2>50 Outstanding Women of Excellence in Nigeria</h2>
              <p style={{ maxWidth: '680px', margin: '14px auto 0', fontSize: '15px', color: '#4c3a48' }}>
                At the heart of HECA 2027 is celebrating 50 remarkable Nigerian women drawn from diverse fields across the country:
              </p>
            </div>
            <div className="award-grid">
              <div className="award-card"><h3>Leadership &amp; Governance</h3></div>
              <div className="award-card"><h3>Government &amp; Public Service</h3></div>
              <div className="award-card"><h3>Business &amp; Entrepreneurship</h3></div>
              <div className="award-card"><h3>Banking &amp; Finance</h3></div>
              <div className="award-card"><h3>Law &amp; Justice</h3></div>
              <div className="award-card"><h3>Medicine &amp; Healthcare</h3></div>
              <div className="award-card"><h3>Education &amp; Academia</h3></div>
              <div className="award-card"><h3>Technology &amp; Innovation</h3></div>
              <div className="award-card"><h3>Media &amp; Communications</h3></div>
              <div className="award-card"><h3>Arts, Culture &amp; Fashion</h3></div>
              <div className="award-card"><h3>Real Estate &amp; Infrastructure</h3></div>
              <div className="award-card"><h3>Philanthropy &amp; Humanitarian Service</h3></div>
              <div className="award-card"><h3>Agriculture &amp; Food Security</h3></div>
              <div className="award-card"><h3>Social Entrepreneurship</h3></div>
              <div className="award-card"><h3>Diplomacy &amp; International Dev.</h3></div>
            </div>
          </div>
        </section>

        {/* Special Initiatives */}
        <section className="section">
          <div className="wrap">
            <div className="section-head center">
              <div className="kicker">
                <span className="rule"></span>BEYOND THE AWARDS
              </div>
              <h2>Special Initiatives &amp; Enduring Legacy</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '28px',
                marginTop: '20px',
              }}
            >
              <div style={{ border: '1px solid var(--gold-500)', padding: '32px', background: 'var(--ivory)' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: 'var(--gold-500)',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}
                >
                  Commemorative Book
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--plum-950)' }}>
                  &ldquo;Her Excellence: 50 Women of Excellence in Nigeria&rdquo;
                </h3>
                <p style={{ fontSize: '15px', color: '#4c3a48', lineHeight: 1.6 }}>
                  A special landmark publication documenting the journeys, biographies, career milestones, leadership
                  philosophies, and advice to young women from each of the 50 honourees — serving as a lasting historical
                  record and source of inspiration.
                </p>
              </div>
              <div style={{ border: '1px solid var(--gold-500)', padding: '32px', background: 'var(--ivory)' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: 'var(--gold-500)',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}
                >
                  Future Leaders
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--plum-950)' }}>
                  HECA Next Generation Women Initiative
                </h3>
                <p style={{ fontSize: '15px', color: '#4c3a48', lineHeight: 1.6 }}>
                  Extending beyond recognition to create practical pathways for young women through mentorship,
                  leadership training, digital skills, personal branding, financial literacy, and entrepreneurship
                  development.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organised by Aso Multi Media */}
        <section className="section" style={{ background: 'var(--ivory-dim)' }}>
          <div className="wrap" style={{ maxWidth: '920px' }}>
            <div className="section-head">
              <div className="kicker">
                <span className="rule"></span>WHO'S BEHIND IT
              </div>
              <h2>Organised by ASO MULTI MEDIA</h2>
            </div>
            <div className="host-row">
              <div
                className="host-avatar"
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/assets/aso-logo.png"
                  alt="Aso Multi Media Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className="host-copy">
                <h3>Aso Multi Media</h3>
                <p>
                  Her Excellence Conference &amp; Awards 2027 is proudly organised by <strong>ASO MULTI MEDIA</strong>,
                  leaders in premier national celebrations, media documentation, and high-impact corporate summits across
                  Nigeria.
                </p>
                <div style={{ marginTop: '16px', fontSize: '14.5px', color: 'var(--plum-900)', display: 'grid', gap: '8px' }}>
                  <div>
                    <strong>Abuja Headquarters:</strong> Suite 22-23 Ambeez Plaza, Ndola Crescent Wuse Zone 5, Abuja, Nigeria
                  </div>
                  <div>
                    <strong>Lagos Office:</strong> No. 25 Ayo Fasugba Street Magodo Phase 1, Gateway Estate, Lagos
                  </div>
                  <div>
                    <strong>Telephone:</strong> +234 806 955 2027 &middot; +234 803 679 8508
                  </div>
                  <div>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:asomultimediatv@gmail.com" style={{ color: 'var(--plum-800)', textDecoration: 'underline' }}>
                      asomultimediatv@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Official Event Crest */}
        <section className="section" style={{ paddingTop: '40px', paddingBottom: '70px' }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <div
              className="crest-frame"
              style={{
                maxWidth: '540px',
                border: '1px solid var(--gold-500)',
                padding: '16px',
                background: '#fff',
                margin: '0 auto',
                boxShadow: '0 8px 30px rgba(43,15,38,0.08)',
              }}
            >
              <img
                src="/assets/logo-full.jpg"
                alt="Her Excellence Conference & Awards official event badge"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <p className="crest-caption" style={{ marginTop: '16px', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--plum-700)' }}>
              The Official Her Excellence Conference &amp; Awards 2027 Mark
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="section">
          <div className="wrap" style={{ maxWidth: '820px' }}>
            <div className="section-head center">
              <div className="kicker">
                <span className="rule"></span>GOOD TO KNOW &middot; ABUJA EDITION
              </div>
              <h2>Frequently asked questions</h2>
            </div>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Where and when is the Abuja Edition taking place?</h3>
                <p>
                  The Abuja Edition will take place on <strong>Saturday, 20th March 2027</strong> at the{' '}
                  <strong>Wells Carlton Hotel &amp; Apartment Abuja</strong>.
                </p>
              </div>
              <div className="faq-item">
                <h3>What is the theme and focus of the Abuja event?</h3>
                <p>
                  The overarching theme is <em>"Women of Excellence: Leading Change, Creating Impact, Building Legacies"</em>.
                  The Abuja edition specifically spotlights <strong>Women, Leadership, Governance &amp; National Development</strong>.
                </p>
              </div>
              <div className="faq-item">
                <h3>Is there a dress code?</h3>
                <p>Yes — Royal Purple &amp; Gold. Formal evening wear or regal traditional attire is warmly encouraged.</p>
              </div>
              <div className="faq-item">
                <h3>Who will be attending?</h3>
                <p>
                  HECA 2027 Abuja convenes First Ladies, female legislators, public servants, corporate executives,
                  entrepreneurs, diplomats, development partners, civil society leaders, and emerging young female leaders.
                </p>
              </div>
              <div className="faq-item">
                <h3>How do I confirm my attendance?</h3>
                <p>
                  Please submit your details via our{' '}
                  <Link href="/rsvp" style={{ color: 'var(--plum-800)', textDecoration: 'underline' }}>
                    RSVP page
                  </Link>{' '}
                  or email us directly at{' '}
                  <a href="mailto:asomultimediatv@gmail.com" style={{ color: 'var(--plum-800)', textDecoration: 'underline' }}>
                    asomultimediatv@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Strip */}
        <section className="cta-strip">
          <div className="wrap">
            <h2>Join us at the Wells Carlton Hotel Abuja on 20 March 2027</h2>
            <Link href="/rsvp" className="btn btn-gold">
              RSVP for Abuja Edition
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
