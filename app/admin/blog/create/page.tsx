'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import { getThumbUrl } from '@/lib/media';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

export default function CreateBlogPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('HECA Secretariat');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverId, setCoverId] = useState('');

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPostId, setCreatedPostId] = useState<string | number>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !author.trim() || !excerpt.trim() || !body.trim()) {
      setFormError('Please fill in all required fields (Title, Author, Excerpt, Body).');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch('/api/posts', {
        method: 'POST',
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
      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Failed to publish post.');
      }

      setCreatedPostId(data.id);
      setShowSuccessModal(true);
    } catch (err: any) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '85vh', background: 'var(--ivory)', paddingBottom: '80px' }}>
        <section className="page-banner" style={{ padding: '40px 0 30px' }}>
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>ADMINISTRATION &middot; BLOG &middot; CREATE
            </div>
            <h1>Write New Article</h1>
            <p>Publish inspiring thought leadership, keynote announcements, and official conference coverage.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Back link */}
            <div style={{ marginBottom: '20px' }}>
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
            </div>

            {/* Main Form Container */}
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
              <div style={{ marginBottom: '28px', borderBottom: '1px solid #f0eee9', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--plum-950)', fontWeight: 700 }}>
                  Article Details &amp; Content
                </h2>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Provide the title, metadata, cover photograph, and article body.
                </p>
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

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="field" style={{ marginBottom: '22px' }}>
                  <label htmlFor="postTitle" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Article Title <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="postTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Breaking Barriers: Women Pioneering Clean Energy in Africa"
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '15px' }}
                  />
                </div>

                {/* Author & Date 2-Column */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '22px' }}>
                  <div className="field">
                    <label htmlFor="postAuthor" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Author / Contributor <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="postAuthor"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Dr. Amina Bello"
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="postDate" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                      Publication Date <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      id="postDate"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="field" style={{ marginBottom: '22px' }}>
                  <label htmlFor="postExcerpt" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Short Summary / Excerpt <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    id="postExcerpt"
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A brief 1-2 sentence preview for cards and search engines..."
                    required
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcd8d0', fontSize: '14.5px' }}
                  />
                </div>

                {/* Cover Image Upload (converted directly to bytes) */}
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
                            width: '260px',
                            height: '160px',
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
                          ✓ Image stored in database (Media ID: {coverId})
                        </p>
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
                    ) : (
                      <div>
                        <ImageIcon size={38} color="var(--gold-500)" style={{ margin: '0 auto 10px' }} />
                        <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555' }}>
                          Upload an image file (PNG, JPG, WebP). It is immediately converted to binary bytes in PostgreSQL.
                        </p>
                        <label
                          htmlFor="coverUploadInput"
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
                              <Loader2 size={16} className="animate-spin" /> Uploading to Bytes...
                            </>
                          ) : (
                            <>
                              <Upload size={16} /> Choose Image File
                            </>
                          )}
                        </label>
                        <input
                          id="coverUploadInput"
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

                {/* Article Body */}
                <div className="field" style={{ marginBottom: '32px' }}>
                  <label htmlFor="postBody" style={{ fontWeight: 600, color: 'var(--plum-950)' }}>
                    Article Full Content <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <p style={{ margin: '2px 0 8px', fontSize: '13px', color: '#777' }}>
                    Separate paragraphs with a blank line. You can also use Markdown formatting.
                  </p>
                  <textarea
                    id="postBody"
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write the full article content here..."
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
                    disabled={submitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Publishing...
                      </>
                    ) : (
                      'Publish Article'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Creation Success Modal */}
      <ActionModal
        isOpen={showSuccessModal}
        type="success"
        title="Article Published Successfully!"
        message={`"${title}" has been published and is now live on the Her Excellence platform.`}
        confirmLabel="Go to Articles List"
        cancelLabel="View Public Post"
        onConfirm={() => router.push('/admin/blog')}
        onClose={() => router.push(`/blog/${createdPostId}`)}
      />

      <Footer />
    </>
  );
}
