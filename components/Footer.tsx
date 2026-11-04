'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <img
              src="/assets/logo.png"
              alt="Her Excellence Conference & Awards logo"
              style={{ maxHeight: '48px', width: 'auto' }}
            />
            <span className="brand-word">
              Her <em>Excellence</em>
              <small
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontFamily: "'Work Sans', sans-serif",
                  color: 'var(--gold-400)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: '4px',
                }}
              >
                Abuja Edition 2027
              </small>
            </span>
          </div>

          <nav className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/nominate">Nominate</Link>
            <Link href="/rsvp">RSVP</Link>
            <a href="mailto:asomultimediatv@gmail.com">asomultimediatv@gmail.com</a>
          </nav>
        </div>

        <div className="footer-bottom">
          <div>
            <span>
              &copy; 2027 Her Excellence Conference &amp; Awards. Organised by{' '}
              <strong>ASO MULTI MEDIA</strong>.
            </span>
            <div style={{ marginTop: '6px', opacity: 0.8, fontSize: '12px' }}>
              Suite 22-23 Ambeez Plaza, Ndola Crescent Wuse Zone 5, Abuja &middot; Tel: +234 806 955 2027, +234 803 679 8508
            </div>
          </div>
          <span>Abuja, Nigeria</span>
        </div>
      </div>
    </footer>
  );
}
