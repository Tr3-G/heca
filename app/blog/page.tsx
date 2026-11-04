'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, Heart, Calendar, User, ArrowRight, Search } from 'lucide-react';
import { getThumbUrl } from '@/lib/media';

interface BlogPost {
  id: string | number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string;
  coverId?: string | null;
  views: number;
  likes: number;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPosts = () => {
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load posts');
        return res.json();
      })
      .then((data) => {
        setPosts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? { ...p, likes: data.likes } : p))
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      (p.author && p.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Navbar />

      <main>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>HOME / BLOG
            </div>
            <h1>Stories &amp; updates</h1>
            <p>News, profiles and reflections from the Her Excellence community.</p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            {/* Search bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '36px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '380px',
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8a7686',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 40px',
                    borderRadius: '999px',
                    border: '1px solid #d9b96b',
                    background: '#fff',
                    fontSize: '14.5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ fontSize: '14px', color: '#666' }}>
                {loading ? (
                  <Skeleton width={120} />
                ) : (
                  `Showing ${filteredPosts.length} ${filteredPosts.length === 1 ? 'article' : 'articles'}`
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="gallery-note" style={{ color: '#dc2626' }}>
                Could not load posts right now. Please refresh shortly.
              </div>
            )}

            {/* Skeleton Loading State */}
            {loading && (
              <div className="blog-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      padding: '16px',
                    }}
                  >
                    <Skeleton height={200} borderRadius={6} />
                    <div style={{ marginTop: '14px' }}>
                      <Skeleton width="40%" height={16} />
                      <Skeleton height={24} style={{ margin: '10px 0' }} />
                      <Skeleton count={2} height={14} />
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton width={80} height={16} />
                        <Skeleton width={60} height={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredPosts.length === 0 && !error && (
              <div className="gallery-note">No posts found matching your criteria.</div>
            )}

            {/* Posts Grid with Next.js Image Component */}
            {!loading && (
              <div className="blog-grid" id="blogGrid">
                {filteredPosts.map((p) => {
                  const cover = p.coverId ? getThumbUrl(p.coverId, 800) : null;
                  return (
                    <Link
                      key={p.id}
                      href={`/blog/${p.id}`}
                      className="blog-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textDecoration: 'none',
                        color: 'inherit',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        className={cover ? 'bc-media' : 'bc-media bc-empty'}
                        style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}
                      >
                        {cover ? (
                          <Image
                            src={cover}
                            alt={p.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover' }}
                            unoptimized={cover.startsWith('/api/')}
                          />
                        ) : null}
                      </div>

                      <div className="bc-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div
                          className="post-meta"
                          style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {formatDate(p.date)}
                          </span>
                          {p.author && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={13} /> {p.author}
                            </span>
                          )}
                        </div>

                        <h3 style={{ margin: '10px 0 8px', fontSize: '20px', lineHeight: 1.3 }}>{p.title}</h3>

                        <p style={{ flex: 1, fontSize: '14.5px', color: '#555', marginBottom: '16px' }}>
                          {p.excerpt || (p.body ? p.body.slice(0, 140) + '...' : '')}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid rgba(200,160,77,0.2)',
                            paddingTop: '12px',
                            marginTop: 'auto',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
                            <span
                              title="Views"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#777' }}
                            >
                              <Eye size={15} /> {p.views || 0}
                            </span>
                            <button
                              onClick={(e) => handleLike(e, p.id)}
                              title="Like this post"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: (p.likes || 0) > 0 ? '#e11d48' : '#777',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              <Heart size={15} fill={(p.likes || 0) > 0 ? '#e11d48' : 'none'} /> {p.likes || 0}
                            </button>
                          </div>

                          <span className="bc-more" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Read more <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
