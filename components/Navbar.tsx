'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ isTransparent = false }: { isTransparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isTransparent) return;
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparent]);

  const headerClass = `site-header ${isTransparent && !scrolled ? 'is-transparent' : ''}`;

  return (
    <header className={headerClass} id="siteHeader">
      <div className="wrap">
        <Link href="/" className="brand">
          <img
            src="/assets/logo.png"
            alt="Her Excellence Conference & Awards logo"
            style={{ height: '42px', width: 'auto' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="brand-word">
            Her <em>Excellence</em>{' '}
            <span
              style={{
                fontSize: '12px',
                letterSpacing: '0.08em',
                opacity: 0.85,
                textTransform: 'uppercase',
                marginLeft: '6px',
                fontFamily: "'Work Sans', sans-serif",
              }}
            >
              Abuja
            </span>
          </span>
        </Link>

        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`} id="siteNav">
          <Link
            href="/"
            className={pathname === '/' ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={pathname === '/about' ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/gallery"
            className={pathname === '/gallery' ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            href="/blog"
            className={pathname.startsWith('/blog') ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/nominate"
            className={pathname === '/nominate' ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Nominate
          </Link>
          <Link
            href="/rsvp"
            className={`nav-cta ${pathname === '/rsvp' ? 'is-active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            RSVP
          </Link>
        </nav>
      </div>
    </header>
  );
}
