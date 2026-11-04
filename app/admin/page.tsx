'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import Skeleton from 'react-loading-skeleton';
import {
  FileText,
  Users,
  UserCheck,
  Image as ImageIcon,
  PlusCircle,
  Eye,
  Heart,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

interface StaffUser {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface BlogPost {
  id: string | number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  views: number;
  likes: number;
}

interface Nomination {
  id: string | number;
  nomineeName: string;
  category: string;
  organisation?: string;
  nominatorName: string;
  status: string;
  createdAt?: string;
}

export default function AdminOverviewPage() {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Summary counts
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);

  useEffect(() => {
    // 1. Check user auth
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // 2. Fetch stats
    Promise.all([
      fetch('/api/posts').then((r) => r.json()).catch(() => []),
      fetch('/api/nominations').then((r) => r.json()).catch(() => ({ nominations: [] })),
      fetch('/api/staff').then((r) => r.json()).catch(() => []),
      fetch('/api/gallery').then((r) => r.json()).catch(() => []),
    ]).then(([postsData, nomsData, staffData, galleryData]) => {
      setPosts(Array.isArray(postsData) ? postsData : []);
      setNominations(nomsData.nominations || []);
      setStaffCount(Array.isArray(staffData) ? staffData.length : 0);
      setGalleryCount(Array.isArray(galleryData) ? galleryData.length : 0);
      setLoading(false);
    });
  }, []);

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; PORTAL OVERVIEW
            </div>
            <h1>Editorial &amp; Awards Dashboard</h1>
            <p>Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}. Manage your conference content, award nominees, and media gallery.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav currentUser={currentUser} />

            {/* Quick Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px',
              }}
            >
              {/* Stat 1: Blog */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(43,15,38,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Articles Published
                  </span>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(200, 160, 77, 0.12)',
                      color: 'var(--gold-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--plum-950)', marginBottom: '8px' }}>
                  {loading ? <Skeleton width={60} /> : posts.length}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#777' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} /> {totalViews} views
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={14} /> {totalLikes} likes
                  </span>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f1f1' }}>
                  <Link
                    href="/admin/blog"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--plum-950)',
                    }}
                  >
                    Manage Articles <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Stat 2: Nominations */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(43,15,38,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Award Nominations
                  </span>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(43, 15, 38, 0.08)',
                      color: 'var(--plum-950)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--plum-950)', marginBottom: '8px' }}>
                  {loading ? <Skeleton width={60} /> : nominations.length}
                </div>
                <div style={{ fontSize: '13px', color: '#777' }}>
                  {nominations.filter((n) => n.status === 'Pending Review').length} pending review
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f1f1' }}>
                  <Link
                    href="/admin/nominations"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--plum-950)',
                    }}
                  >
                    Review Nominees <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Stat 3: Staff */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(43,15,38,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Staff Accounts
                  </span>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(200, 160, 77, 0.12)',
                      color: 'var(--gold-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UserCheck size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--plum-950)', marginBottom: '8px' }}>
                  {loading ? <Skeleton width={60} /> : staffCount}
                </div>
                <div style={{ fontSize: '13px', color: '#777' }}>
                  Active administrators &amp; editors
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f1f1' }}>
                  <Link
                    href="/admin/staff"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--plum-950)',
                    }}
                  >
                    Manage Staff <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Stat 4: Gallery */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(43,15,38,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Event Photographs
                  </span>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(43, 15, 38, 0.08)',
                      color: 'var(--plum-950)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ImageIcon size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--plum-950)', marginBottom: '8px' }}>
                  {loading ? <Skeleton width={60} /> : galleryCount}
                </div>
                <div style={{ fontSize: '13px', color: '#777' }}>
                  Stored in PostgreSQL (binary bytes)
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f1f1' }}>
                  <Link
                    href="/admin/gallery"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--plum-950)',
                    }}
                  >
                    View Gallery <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--plum-950) 0%, #1f0b1b 100%)',
                color: '#fff',
                padding: '24px 28px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(43,15,38,0.12)',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 6px', color: 'var(--gold-400)', fontSize: '18px', fontWeight: 600 }}>
                  Quick Content Actions
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.78)', fontSize: '14px' }}>
                  Publish new insights, record award nominees, or update the photograph collection.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/admin/blog/create"
                  className="btn btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px' }}
                >
                  <PlusCircle size={16} /> New Article
                </Link>
                <Link
                  href="/admin/nominations/create"
                  className="btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <PlusCircle size={16} /> Add Nominee
                </Link>
              </div>
            </div>

            {/* Two Column Layout: Recent Articles & Recent Nominations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
              {/* Left: Recent Blog Posts */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(43,15,38,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--plum-950)', fontWeight: 600 }}>
                    Recent Blog Posts
                  </h3>
                  <Link
                    href="/admin/blog"
                    style={{ fontSize: '13px', color: 'var(--plum-800)', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    View All ({posts.length})
                  </Link>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Skeleton height={48} />
                    <Skeleton height={48} />
                    <Skeleton height={48} />
                  </div>
                ) : posts.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic', margin: '20px 0' }}>
                    No blog posts published yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {posts.slice(0, 4).map((post) => (
                      <div
                        key={post.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '8px',
                          background: '#faf9f6',
                          border: '1px solid #f0eee9',
                        }}
                      >
                        <div style={{ maxWidth: '72%' }}>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            style={{
                              fontSize: '14.5px',
                              fontWeight: 600,
                              color: 'var(--plum-950)',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {post.title}
                          </Link>
                          <div style={{ fontSize: '12px', color: '#777', marginTop: '3px' }}>
                            {post.author} &middot; {post.date}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="btn btn-gold"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Recent Nominations */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(43,15,38,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--plum-950)', fontWeight: 600 }}>
                    Recent Nominations
                  </h3>
                  <Link
                    href="/admin/nominations"
                    style={{ fontSize: '13px', color: 'var(--plum-800)', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    View All ({nominations.length})
                  </Link>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Skeleton height={48} />
                    <Skeleton height={48} />
                    <Skeleton height={48} />
                  </div>
                ) : nominations.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic', margin: '20px 0' }}>
                    No nominations recorded yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {nominations.slice(0, 4).map((nom) => (
                      <div
                        key={nom.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '8px',
                          background: '#faf9f6',
                          border: '1px solid #f0eee9',
                        }}
                      >
                        <div style={{ maxWidth: '70%' }}>
                          <Link
                            href={`/admin/nominations/${nom.id}`}
                            style={{
                              fontSize: '14.5px',
                              fontWeight: 600,
                              color: 'var(--plum-950)',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {nom.nomineeName}
                          </Link>
                          <div style={{ fontSize: '12px', color: '#777', marginTop: '3px' }}>
                            {nom.category} &middot; {nom.organisation || 'Independent'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: nom.status === 'Approved' ? '#dcfce7' : '#fef9c3',
                              color: nom.status === 'Approved' ? '#166534' : '#854d0e',
                            }}
                          >
                            {nom.status}
                          </span>
                          <Link
                            href={`/admin/nominations/${nom.id}`}
                            className="btn btn-gold"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
