'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminNav from '@/components/AdminNav';
import ActionModal from '@/components/ActionModal';
import Skeleton from 'react-loading-skeleton';
import { getThumbUrl } from '@/lib/media';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  name?: string;
  alt?: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  // Upload image states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessModal, setUploadSuccessModal] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const loadGallery = () => {
    setLoading(true);
    fetch('/api/gallery')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load gallery images');
        return res.json();
      })
      .then((data) => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('heca_token') || '';
      // 1. Upload file as bytes into PostgreSQL media_files
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image as bytes.');
      }

      // 2. Register media ID into gallery
      const regRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          driveId: String(data.id),
          name: file.name.replace(/\.[^/.]+$/, ''),
          alt: 'Her Excellence Conference photograph',
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error || 'Failed to register photo to gallery.');
      }

      setUploadSuccessModal(true);
      loadGallery();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('heca_token') || '';
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove photo.');
      }

      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
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
              <span className="rule"></span>ADMINISTRATION &middot; MEDIA &amp; PHOTOGRAPHS
            </div>
            <h1>Event Photography &amp; Gallery</h1>
            <p>Upload conference photographs, preview in high resolution, and manage gallery exhibits.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="wrap">
            <AdminNav />

            {/* Header with Title and Actions */}
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
                  Event Photographs ({images.length})
                </h2>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  Click on any photograph to preview it in a lightbox modal. All images are stored as binary bytes.
                </p>
              </div>

              {/* Upload to Bytes Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label
                  htmlFor="galleryUploadInput"
                  className="btn btn-gold"
                  style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(200, 160, 77, 0.3)',
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Uploading to Bytes...
                    </>
                  ) : (
                    <>
                      <Upload size={18} /> Upload New Photo
                    </>
                  )}
                </label>
                <input
                  id="galleryUploadInput"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {uploadError && (
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
                <AlertCircle size={18} /> {uploadError}
              </div>
            )}

            {/* Gallery Grid */}
            {loading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Skeleton key={n} height={200} borderRadius={8} />
                ))}
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
            ) : images.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0ded9',
                  borderRadius: '10px',
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <ImageIcon size={42} color="var(--gold-500)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px', color: 'var(--plum-950)' }}>
                  No Photographs Available
                </h3>
                <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
                  Upload your first photograph using the button above.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '18px',
                }}
              >
                {images.map((img, index) => {
                  const thumbSrc = getThumbUrl(img.id, 600);
                  return (
                    <div
                      key={img.id + '-' + index}
                      style={{
                        background: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #e5e5e5',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Photo Thumbnail - click to open modal preview */}
                      <div
                        onClick={() => setPreviewImage(img)}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '190px',
                          cursor: 'pointer',
                          background: '#f2f0eb',
                          overflow: 'hidden',
                        }}
                        title="Click to view full preview in modal"
                      >
                        <Image
                          src={thumbSrc}
                          alt={img.alt || img.name || 'Event photo'}
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized={true}
                          loading="lazy"
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(23,7,21,0.3)',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            gap: '6px',
                            fontWeight: 600,
                            fontSize: '13px',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '0';
                          }}
                        >
                          <Eye size={18} /> Click to Preview
                        </div>
                      </div>

                      {/* Footer card information & Delete action */}
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: '#fff',
                          borderTop: '1px solid #f0eee9',
                        }}
                      >
                        <div style={{ maxWidth: '75%' }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: 'var(--plum-950)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {img.name || `Photo #${img.id}`}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#888' }}>
                            ID: {img.id}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewImage(img)}
                            title="Preview Modal"
                            style={{
                              padding: '6px 8px',
                              background: '#f4f3f0',
                              border: '1px solid #dcd8d0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: 'var(--plum-950)',
                              display: 'inline-flex',
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(img)}
                            title="Delete Photo"
                            style={{
                              padding: '6px 8px',
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#b91c1c',
                              display: 'inline-flex',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Gallery Photograph Preview Modal */}
      <ActionModal
        isOpen={Boolean(previewImage)}
        type="image-preview"
        title={previewImage?.name || `Photograph #${previewImage?.id}`}
        message={previewImage?.alt || 'Her Excellence Conference photograph'}
        imageSrc={previewImage ? getThumbUrl(previewImage.id, 1600) : undefined}
        imageName={previewImage?.name}
        onClose={() => setPreviewImage(null)}
      />

      {/* Upload Success Modal */}
      <ActionModal
        isOpen={uploadSuccessModal}
        type="success"
        title="Photograph Uploaded Successfully!"
        message="The photograph was converted to binary bytes and stored securely in the database. It is now live in the gallery."
        confirmLabel="Continue"
        onConfirm={() => setUploadSuccessModal(false)}
        onClose={() => setUploadSuccessModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={Boolean(deleteTarget)}
        type="confirm"
        isDangerous={true}
        loading={deleting}
        title="Delete Photograph from Gallery?"
        message={`Are you sure you want to remove "${deleteTarget?.name || `Photo #${deleteTarget?.id}`}"?`}
        confirmLabel="Yes, Remove Photo"
        cancelLabel="Keep Photo"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      {/* Delete Success Modal */}
      <ActionModal
        isOpen={deleteSuccessModal}
        type="success"
        title="Photograph Removed"
        message="The photo has been removed from the gallery."
        confirmLabel="Dismiss"
        onConfirm={() => setDeleteSuccessModal(false)}
        onClose={() => setDeleteSuccessModal(false)}
      />

      <Footer />
    </>
  );
}
