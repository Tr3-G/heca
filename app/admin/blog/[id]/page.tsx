'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import Skeleton from 'react-loading-skeleton';
import { getThumbUrl } from '@/lib/media';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  ExternalLink,
  Trash2,
  Save,
  Image as ImageIcon,
  Loader2,
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

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverId, setCoverId] = useState('');

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Save changes state
  const [saving, setSaving] = useState(false);
  const [saveSuccessModal, setSaveSuccessModal] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/posts/${id}?noIncrement=true`)
      .then((res) => {
        if (!res.ok) throw new Error('Article not found or failed to load.');
        return res.json();
      })
      .then((data: BlogPost) => {
        setPost(data);
        setTitle(data.title || '');
        setAuthor(data.author || '');
        setDate(data.date || '');
        setExcerpt(data.excerpt || '');
        setBody(data.body || '');
        setCoverId(data.coverId ? String(data.coverId) : '');
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image as bytes.');
      }

      setCoverId(String(data.id));
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !author.trim() || !excerpt.trim() || !body.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          date,
          excerpt: excerpt.trim(),
          body: body.trim(),
          coverId: coverId ? String(coverId).trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update article.');
      }

      setPost((prev) => (prev ? { ...prev, title, author, date, excerpt, body, coverId } : null));
      setSaveSuccessModal(true);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete article.');
      }

      setShowDeleteModal(false);
      setDeleteSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; BLOG &middot; VIEW &amp; EDIT
            </div>
            <h1>View &amp; Edit Article</h1>
            <p>Modify article content, replace cover photography, and inspect reader statistics.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Back link & Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <Link
                href="/admin/blog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--plum-950)',
                }}
              >
                <ArrowLeft size={16} /> Back to All Articles
              </Link>

              {post && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link
                    href={`/blog/${post.id}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#fff',
                      border: '1px solid #dcd8d0',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      color: 'var(--plum-950)',
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={15} /> View Live on Website
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={15} /> Delete Article
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ maxWidth: '920px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '12px' }}>
                <Skeleton height={32} width="60%" style={{ marginBottom: '16px' }} />
                <Skeleton height={200} style={{ marginBottom: '20px' }} />
                <Skeleton height={300} />
              </div>
            ) : loadError ? (
              <div
                style={{
                  maxWidth: '920px',
                  margin: '0 auto',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '32px',
                  textAlign: 'center',
                  color: '#991b1b',
                }}
              >
                <AlertCircle size={36} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 8px' }}>{loadError}</h3>
                <Link href="/admin/blog" className="btn btn-gold" style={{ marginTop: '16px', display: 'inline-block' }}>
                  Return to Articles List
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '12px',
                  padding: '36px',
                  boxShadow: '0 4px 20px rgba(43,15,38,0.05)',
                  maxWidth: '920px',
                  margin: '0 auto',
                }}
              >
                {/* Metrics header */}
                <div
                  style={{
                    background: '#faf9f6',
                    border: '1px solid #eeebe4',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '28px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Article ID: #{post?.id}
                    </span>
                    <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: 'var(--plum-950)' }}>
                      {post?.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--plum-950)' }}>
                      <Eye size={17} color="var(--gold-600)" />
                      <strong>{post?.views || 0}</strong> views
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#dc2626' }}>
                      <Heart size={17} />
                      <strong>{post?.likes || 0}</strong> likes
                    </div>
                  </div>
                </div>

                {formError && (
                  <div
                    style={{
                      padding: '14px 18px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#991b1b',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                    }}
                  >
                    <AlertCircle size={18} /> {formError}
                  </div>
                )}

                <form onSubmit={handleSave}>
                  {/* Title */}
                  <div className="field" style={{ marginBottom: '22px' }}>
                    <label htmlFor="editTitle" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Article Title <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="editTitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '15px' }}
                    />
                  </div>

                  {/* Author & Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '22px' }}>
                    <div className="field">
                      <label htmlFor="editAuthor" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Author / Contributor <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="editAuthor"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="editDate" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                        Publication Date <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="date"
                        id="editDate"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="field" style={{ marginBottom: '22px' }}>
                    <label htmlFor="editExcerpt" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Short Summary / Excerpt <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      id="editExcerpt"
                      rows={3}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                    />
                  </div>

                  {/* Cover Image Upload (Database bytes) */}
                  <div className="field" style={{ marginBottom: '24px' }}>
                    <label style={{ fontWeight: 600, color: 'var(--plum-950)', display: 'block', marginBottom: '6px' }}>
                      Featured Cover Photograph (Converted directly to Database Bytes)
                    </label>
                    <div
                      style={{
                        border: '2px dashed #dcd8d0',
                        borderRadius: '8px',
                        padding: '24px',
                        textAlign: 'center',
                        background: '#faf9f6',
                      }}
                    >
                      {coverId ? (
                        <div>
                          <div
                            style={{
                              position: 'relative',
                              width: '280px',
                              height: '170px',
                              margin: '0 auto 12px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Image
                              src={getThumbUrl(coverId, 600)}
                              alt="Cover preview"
                              fill
                              style={{ objectFit: 'cover' }}
                              unoptimized={true}
                            />
                          </div>
                          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                            ✓ Active Cover Image (Media ID: {coverId})
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <label
                              htmlFor="replaceCoverInput"
                              style={{
                                background: '#fff',
                                color: 'var(--plum-950)',
                                border: '1px solid #dcd8d0',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              {uploadingImage ? 'Uploading...' : 'Replace Photo'}
                            </label>
                            <input
                              id="replaceCoverInput"
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              disabled={uploadingImage}
                              style={{ display: 'none' }}
                            />
                            <button
                              type="button"
                              onClick={() => setCoverId('')}
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '13px',
                                cursor: 'pointer',
                              }}
                            >
                              Remove Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <ImageIcon size={38} color="var(--gold-500)" style={{ margin: '0 auto 10px' }} />
                          <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555' }}>
                            No cover photograph currently set. Upload a photo to be saved as bytes.
                          </p>
                          <label
                            htmlFor="addCoverInput"
                            className="btn btn-gold"
                            style={{
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 18px',
                              fontSize: '14px',
                            }}
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={16} /> Choose Image File
                              </>
                            )}
                          </label>
                          <input
                            id="addCoverInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            disabled={uploadingImage}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}

                      {uploadError && (
                        <p style={{ margin: '12px 0 0', color: '#dc2626', fontSize: '13px' }}>
                          {uploadError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="field" style={{ marginBottom: '32px' }}>
                    <label htmlFor="editBody" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Article Full Content <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      id="editBody"
                      rows={14}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '6px',
                        border: '1px solid #dcd8d0',
                        fontSize: '15px',
                        lineHeight: 1.6,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
                    <Link
                      href="/admin/blog"
                      style={{
                        padding: '12px 20px',
                        borderRadius: '6px',
                        border: '1px solid #dcd8d0',
                        background: '#f4f3f0',
                        color: '#555',
                        fontSize: '14.5px',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      className="btn btn-gold"
                      disabled={saving}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 28px',
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Save Success Modal */}
      <ActionModal
        isOpen={saveSuccessModal}
        type="success"
        title="Changes Saved Successfully!"
        message={`"${title}" has been updated and your changes are now live.`}
        confirmLabel="Stay on Page"
        cancelLabel="Back to Articles"
        onConfirm={() => setSaveSuccessModal(false)}
        onClose={() => router.push('/admin/blog')}
      />

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        type="confirm"
        isDangerous={true}
        loading={deleting}
        title="Delete Blog Article?"
        message={`Are you sure you want to permanently delete "${post?.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Keep Article"
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setShowDeleteModal(false);
        }}
      />

      {/* Delete Success Modal */}
      <ActionModal
        isOpen={deleteSuccessModal}
        type="success"
        title="Article Deleted"
        message="The article has been permanently removed."
        confirmLabel="Return to Articles"
        onConfirm={() => router.push('/admin/blog')}
        onClose={() => router.push('/admin/blog')}
      />

      <Footer />
    </>
  );
}
