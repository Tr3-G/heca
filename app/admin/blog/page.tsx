'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import Skeleton from 'react-loading-skeleton';
import { getThumbUrl } from '@/lib/media';
import {
  PlusCircle,
  Search,
  Eye,
  Heart,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';

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

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadPosts = () => {
    setLoading(true);
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('heca_token') || ''}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete post');
      }
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg(`Article "${deleteTarget.title}" was deleted successfully.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; ARTICLES &amp; NEWS
            </div>
            <h1>Editorial &amp; Blog Management</h1>
            <p>Publish, edit, and organize all conference news, keynote announcements, and thought leadership articles.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Header with Title and Create Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--plum-950)', fontWeight: 700 }}>
                  Published Articles ({posts.length})
                </h2>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Manage and monitor live articles, view counts, and reader engagement.
                </p>
              </div>

              <Link
                href="/admin/blog/create"
                className="btn btn-gold"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(200, 160, 77, 0.3)',
                }}
              >
                <PlusCircle size={18} /> Create New Article
              </Link>
            </div>

            {/* Search Filter Bar */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e0ded9',
                borderRadius: '8px',
                padding: '12px 18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <Search size={18} color="#888" />
              <input
                type="text"
                placeholder="Search articles by title or author name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px',
                  background: 'transparent',
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Articles Table */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton height={70} />
                <Skeleton height={70} />
                <Skeleton height={70} />
              </div>
            ) : error ? (
              <div
                style={{
                  padding: '24px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <AlertCircle size={20} /> {error}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0ded9',
                  borderRadius: '10px',
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <FileText size={42} color="var(--gold-500)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px', color: 'var(--plum-950)' }}>
                  {searchTerm ? 'No matching articles found' : 'No articles published yet'}
                </h3>
                <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Click below to write your first blog post.'}
                </p>
                <Link href="/admin/blog/create" className="btn btn-gold" style={{ padding: '10px 20px' }}>
                  Write First Article
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(43,15,38,0.04)',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#faf9f6', borderBottom: '1px solid #e8e6e1', fontSize: '13px', color: '#555' }}>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Article</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Author</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Engagement</th>
                        <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.map((post) => {
                        const coverSrc = post.coverId ? getThumbUrl(post.coverId, 200) : null;
                        return (
                          <tr
                            key={post.id}
                            style={{
                              borderBottom: '1px solid #f0eee9',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            {/* Title & Cover */}
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                {coverSrc ? (
                                  <div
                                    style={{
                                      width: '60px',
                                      height: '46px',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      flexShrink: 0,
                                      position: 'relative',
                                      background: '#f2f0eb',
                                    }}
                                  >
                                    <Image
                                      src={coverSrc}
                                      alt={post.title}
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      unoptimized={true}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: '60px',
                                      height: '46px',
                                      borderRadius: '6px',
                                      background: 'rgba(200, 160, 77, 0.15)',
                                      color: 'var(--gold-600)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <FileText size={20} />
                                  </div>
                                )}
                                <div>
                                  <Link
                                    href={`/admin/blog/${post.id}`}
                                    style={{
                                      fontSize: '15px',
                                      fontWeight: 600,
                                      color: 'var(--plum-950)',
                                      display: 'block',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {post.title}
                                  </Link>
                                  <div
                                    style={{
                                      fontSize: '13px',
                                      color: '#777',
                                      maxWidth: '420px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {post.excerpt || 'No excerpt'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Author */}
                            <td style={{ padding: '16px 18px', fontSize: '14px', color: '#444' }}>
                              {post.author}
                            </td>

                            {/* Date */}
                            <td style={{ padding: '16px 18px', fontSize: '13.5px', color: '#666' }}>
                              {post.date}
                            </td>

                            {/* Engagement */}
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#666' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Eye size={15} color="var(--plum-800)" /> {post.views || 0}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Heart size={15} color="#dc2626" /> {post.likes || 0}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Link
                                  href={`/blog/${post.id}`}
                                  target="_blank"
                                  title="View Public Post"
                                  style={{
                                    padding: '8px',
                                    color: '#666',
                                    background: '#f4f3f0',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                  }}
                                >
                                  <ExternalLink size={15} />
                                </Link>

                                <Link
                                  href={`/admin/blog/${post.id}`}
                                  className="btn btn-gold"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Edit size={14} /> View / Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(post)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px 12px',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                  }}
                                  title="Delete Article"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={Boolean(deleteTarget)}
        type="confirm"
        isDangerous={true}
        loading={deleting}
        title="Delete Blog Article?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Article"
        cancelLabel="Keep Article"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      {/* Action Success Modal */}
      <ActionModal
        isOpen={Boolean(successMsg)}
        type="success"
        title="Action Completed"
        message={successMsg}
        confirmLabel="Dismiss"
        onConfirm={() => setSuccessMsg('')}
        onClose={() => setSuccessMsg('')}
      />

      <Footer />
    </>
  );
}
