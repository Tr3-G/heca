'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, Heart, Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
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

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (!post || hasLiked) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPost({ ...post, likes: data.likes });
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderBody = (text: string) => {
    if (!text) return null;
    const paras = text.split(/\n\s*\n/);
    return paras.map((p, idx) => {
      const trimmed = p.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', margin: '24px 0 12px', color: 'var(--plum-950)' }}>
            {trimmed.slice(4)}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', margin: '28px 0 14px', color: 'var(--plum-950)' }}>
            {trimmed.slice(3)}
          </h3>
        );
      }
      return (
        <p key={idx} style={{ fontSize: '17px', lineHeight: 1.8, marginBottom: '20px', color: '#333' }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <>
      <Navbar />

      <main>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                HOME
              </Link>{' '}
              /{' '}
              <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>
                BLOG
              </Link>{' '}
              / ARTICLE
            </div>
            <h1 style={{ maxWidth: '24ch', fontSize: 'clamp(28px, 4vw, 44px)' }}>
              {loading ? <Skeleton width="80%" /> : post?.title || 'Stories & updates'}
            </h1>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ maxWidth: '860px' }}>
            <Link
              href="/blog"
              className="back-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '24px',
                color: 'var(--plum-800)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={16} /> Back to all articles
            </Link>

            {/* Skeleton Loading State */}
            {loading && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <Skeleton width={120} height={20} />
                  <Skeleton width={120} height={20} />
                  <Skeleton width={80} height={20} />
                </div>
                <Skeleton height={400} borderRadius={8} style={{ marginBottom: '32px' }} />
                <Skeleton count={6} height={18} style={{ marginBottom: '12px' }} />
              </div>
            )}

            {error && (
              <div className="gallery-note" style={{ color: '#dc2626' }}>
                Post could not be found. Please return to the blog list.
              </div>
            )}

            {post && !loading && (
              <article className="post">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(200,160,77,0.3)',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#666',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={15} color="var(--gold-500)" /> {formatDate(post.date)}
                    </span>
                    {post.author && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <User size={15} color="var(--gold-500)" /> {post.author}
                      </span>
                    )}
                    <span
                      title="Views"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#555' }}
                    >
                      <Eye size={16} /> {post.views || 0} views
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={handleLike}
                      className="btn"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: hasLiked ? '#fee2e2' : '#faf5ec',
                        border: '1px solid ' + (hasLiked ? '#f87171' : '#d9b96b'),
                        color: hasLiked ? '#e11d48' : '#2b0f26',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Heart size={16} fill={hasLiked ? '#e11d48' : 'none'} color="#e11d48" />
                      <span>{post.likes || 0}</span>
                      <span>{hasLiked ? 'Liked!' : 'Like'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: '#faf5ec',
                        border: '1px solid #d9b96b',
                        color: '#2b0f26',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '13.5px',
                        cursor: 'pointer',
                      }}
                      title="Share article"
                    >
                      <Share2 size={15} />
                      <span>{copied ? 'Link Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', marginBottom: '24px', lineHeight: 1.25 }}>
                  {post.title}
                </h2>

                {post.coverId && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '480px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '32px',
                      border: '1px solid rgba(200,160,77,0.3)',
                      boxShadow: '0 8px 30px rgba(43,15,38,0.06)',
                    }}
                  >
                    <Image
                      src={getThumbUrl(post.coverId, 1600)}
                      alt={post.title}
                      fill
                      priority
                      style={{ objectFit: 'cover' }}
                      unoptimized={post.coverId.startsWith('/api/')}
                    />
                  </div>
                )}

                <div className="post-body">{renderBody(post.body)}</div>

                {/* Bottom interaction strip */}
                <div
                  style={{
                    marginTop: '48px',
                    padding: '24px',
                    background: 'var(--ivory-dim)',
                    borderRadius: '8px',
                    border: '1px solid var(--gold-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '18px', color: 'var(--plum-950)' }}>
                      Did you enjoy this article?
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      Show your appreciation by giving it a like or sharing with your network.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={handleLike}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '999px',
                        background: hasLiked ? '#e11d48' : '#c8a04d',
                        border: 'none',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Heart size={16} fill="#fff" />
                      {hasLiked ? 'Liked' : 'Like'} ({post.likes || 0})
                    </button>
                    <button
                      onClick={handleShare}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        background: '#fff',
                        border: '1px solid #c8a04d',
                        color: 'var(--plum-950)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <Share2 size={16} />
                      {copied ? 'Link Copied!' : 'Share'}
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
