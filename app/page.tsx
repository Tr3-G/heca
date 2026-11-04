import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getThumbUrl } from '@/lib/media';

export default function HomePage() {
  const heroBg = getThumbUrl('1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0', 2000);
  const teaserImg = getThumbUrl('1t7Hcb50WJKQiO8OxFDTkP2yGdK8h4S16', 1000);
  const gMain = getThumbUrl('1ck6t1BfUMtuFBowE8JxnBCrkLP9cxRso', 1200);
  const gSide1 = getThumbUrl('1t7Hcb50WJKQiO8OxFDTkP2yGdK8h4S16', 900);
  const gSide2 = getThumbUrl('1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0', 900);

  return (
    <>
      <Navbar isTransparent={true} />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-media">
            <Image
              src={heroBg}
              alt="Guests gathered at the Her Excellence Conference & Awards"
              fill
              priority
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </div>
          <div className="wrap hero-content">
            <div className="hero-eventmark">
              <span className="rule"></span>
              <span>2nd Edition &middot; Abuja, Nigeria</span>
            </div>
            <div
              style={{
                display: 'inline-block',
                marginBottom: '12px',
                padding: '4px 14px',
                background: 'rgba(200,160,77,0.18)',
                border: '1px solid var(--gold-400)',
                borderRadius: '999px',
                color: 'var(--gold-100)',
                fontSize: '12.5px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Theme: Women of Excellence: Leading Change, Creating Impact, Building Legacies
            </div>
            <h1>
              Her Excellence<br />
              Conference &amp; Awards <span className="year">2027</span>
            </h1>
            <p className="hero-sub">
              A prestigious national platform celebrating{' '}
              <strong>50 Outstanding Women of Excellence in Nigeria</strong> — convening women leaders,
              policymakers, public servants, entrepreneurs, diplomats, and innovators for an impactful afternoon
              in the nation's capital.
            </p>

            <div className="hero-facts">
              <div className="hero-fact">
                <span className="label">DATE</span>
                <span className="value">Saturday, 20 March 2027</span>
              </div>
              <div className="hero-fact">
                <span className="label">VENUE</span>
                <span className="value">Wells Carlton Hotel &amp; Apartment, Abuja</span>
              </div>
              <div className="hero-fact">
                <span className="label">FOCUS &amp; DRESS CODE</span>
                <span className="value">Leadership &amp; Governance &middot; Royal Purple &amp; Gold</span>
              </div>
            </div>

            <div className="hero-actions">
              <Link href="/rsvp" className="btn btn-gold">
                Reserve your seat
              </Link>
              <Link href="/about" className="btn btn-outline">
                Abuja event details
              </Link>
            </div>
          </div>
          <div className="scroll-cue">
            <span className="line"></span> SCROLL
          </div>
        </section>

        {/* STATS */}
        <section className="stats-strip">
          <div className="wrap stats-grid">
            <div>
              <div className="stat-num">2nd</div>
              <div className="stat-label">EDITION</div>
            </div>
            <div>
              <div className="stat-num">50</div>
              <div className="stat-label">WOMEN OF EXCELLENCE HONOURED</div>
            </div>
            <div>
              <div className="stat-num">ABUJA</div>
              <div className="stat-label">WELLS CARLTON HOTEL</div>
            </div>
            <div>
              <div className="stat-num">1</div>
              <div className="stat-label">SHARED LEGACY OF IMPACT</div>
            </div>
          </div>
        </section>

        {/* TEASER */}
        <section className="teaser-strip section">
          <div className="wrap teaser-grid">
            <div className="teaser-media" style={{ position: 'relative', minHeight: '340px' }}>
              <Image
                src={teaserImg}
                alt="Elegant table setting with flowers and a guest's place card at a past Her Excellence event"
                fill
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                unoptimized
              />
            </div>
            <div>
              <div className="section-head">
                <div className="kicker">
                  <span className="rule"></span>ABOUT THE ABUJA EDITION
                </div>
                <h2>Celebrating Excellence &middot; Inspiring Impact &middot; Building Legacies</h2>
              </div>
              <p style={{ fontSize: '16.5px', color: '#4c3a48', maxWidth: '48ch' }}>
                As part of the prestigious national celebrations marking the International Women's Day 2027 season,
                the Abuja Edition of the Her Excellence Conference &amp; Awards (HECA) brings together distinguished
                women leaders, policymakers, public servants, entrepreneurs, diplomats, and young changemakers for
                high-level conversations, recognition, and cross-sector collaboration.
              </p>
              <Link href="/about" className="btn btn-outline-dark" style={{ marginTop: '28px' }}>
                Read the Abuja event overview
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT TO EXPECT */}
        <section className="section">
          <div className="wrap">
            <div className="section-head center">
              <div className="kicker">
                <span className="rule"></span>WHAT TO EXPECT IN ABUJA
              </div>
              <h2>High-level dialogue, national recognition, and lasting legacy</h2>
            </div>
            <div className="expect-grid">
              <div className="expect-card">
                <span className="num">01</span>
                <h3>Leadership &amp; Governance Dialogue</h3>
                <p>
                  Keynote address, women's leadership conference, and dedicated sessions on women in governance,
                  public service, and national development.
                </p>
              </div>
              <div className="expect-card">
                <span className="num">02</span>
                <h3>Recognition of HECA 50 Honourees</h3>
                <p>
                  The signature national presentation celebrating 50 Outstanding Women of Excellence in Nigeria
                  across diverse sectors, alongside special honours.
                </p>
              </div>
              <div className="expect-card">
                <span className="num">03</span>
                <h3>Mentorship, Empowerment &amp; Reception</h3>
                <p>
                  Entrepreneurship dialogues, mentorship conversations connecting emerging women with established
                  leaders, and a cultural networking reception.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY TEASER */}
        <section className="gallery-teaser section" id="gallery">
          <div className="wrap">
            <div className="section-head">
              <div className="kicker">
                <span className="rule"></span>MOMENTS FROM PAST EDITIONS
              </div>
              <h2>A look inside the room</h2>
            </div>
            <div className="gallery-grid">
              <div className="g-main" style={{ position: 'relative', minHeight: '380px' }}>
                <figure style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={gMain}
                    alt="Guests seated together at a past Her Excellence Conference & Awards event"
                    fill
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    unoptimized
                  />
                  <figcaption>Guests gathered at the awards table</figcaption>
                </figure>
              </div>
              <div className="g-side" style={{ position: 'relative', minHeight: '180px' }}>
                <figure style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={gSide1}
                    alt="Table setting detail with flowers and a guest's place card"
                    fill
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    unoptimized
                  />
                  <figcaption>A place at the table</figcaption>
                </figure>
              </div>
              <div className="g-side" style={{ position: 'relative', minHeight: '180px' }}>
                <figure style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={gSide2}
                    alt="Guests in coordinated attire at a past edition of the conference"
                    fill
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    unoptimized
                  />
                  <figcaption>Coordinated in royal purple and gold</figcaption>
                </figure>
              </div>
            </div>
            <Link href="/gallery" className="btn btn-gold" style={{ marginTop: '36px' }}>
              View the full gallery
            </Link>
          </div>
        </section>

        {/* QUOTE BLOCK */}
        <section className="quote-block">
          <div className="wrap">
            <blockquote>&ldquo;Celebrating Excellence &middot; Inspiring Impact &middot; Building Legacies&rdquo;</blockquote>
            <cite>— Her Excellence Conference &amp; Awards 2027 &middot; Abuja Edition</cite>
          </div>
        </section>

        {/* CTA */}
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
