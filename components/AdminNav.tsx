'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

interface StaffUser {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function AdminNav({ currentUser }: { currentUser?: StaffUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(currentUser || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      fetch('/api/auth/check')
        .then((r) => r.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('heca_token');
    window.location.href = '/admin/login';
  };

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Blog Posts', href: '/admin/blog', icon: FileText, exact: false },
    { label: 'Nominations', href: '/admin/nominations', icon: Users, exact: false },
    { label: 'Staff Accounts', href: '/admin/staff', icon: UserCheck, exact: false },
    { label: 'Event Gallery', href: '/admin/gallery', icon: ImageIcon, exact: false },
    { label: 'Change Password', href: '/admin/password', icon: KeyRound, exact: true },
  ];

  const isLinkActive = (item: typeof navLinks[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Top User Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px 24px',
          background: '#fff',
          border: '1px solid var(--gold-500)',
          borderRadius: '10px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(43,15,38,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--plum-950)',
              color: 'var(--gold-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '17px',
              boxShadow: '0 2px 6px rgba(43,15,38,0.2)',
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--plum-950)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{user?.name || 'Administrator'}</span>
              <span
                style={{
                  fontSize: '11.5px',
                  padding: '2px 9px',
                  background: 'rgba(200,160,77,0.18)',
                  color: 'var(--plum-950)',
                  border: '1px solid var(--gold-400)',
                  borderRadius: '999px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {user?.role || 'Admin'}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
              {user?.email || 'admin@heca.ng'} {user?.phone ? `\u00B7 Tel: ${user.phone}` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            href="/admin/password"
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#faf5ec',
              border: '1px solid #d9b96b',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--plum-950)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <KeyRound size={15} /> Change Password
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#fee2e2',
              border: '1px solid #f87171',
              color: '#991b1b',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '2px solid rgba(200,160,77,0.3)',
          paddingBottom: '4px',
        }}
      >
        {navLinks.map((item) => {
          const active = isLinkActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                background: active ? 'var(--plum-950)' : '#f1e9db',
                color: active ? '#fff' : 'var(--plum-950)',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
