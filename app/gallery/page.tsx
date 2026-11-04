'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getThumbUrl } from '@/lib/media';

interface GalleryItem {
  id: string;
  name?: string;
  alt?: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load gallery');
        return res.json();
      })
      .then((data) => {
        setImages(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
  };

  const closeLightbox = () => {
    setActiveIndex(null);
  };

  const showNext = useCallback(() => {
    if (activeIndex === null || images.length === 0) return;
    setActiveIndex((activeIndex + 1) % images.length);
  }, [activeIndex, images.length]);

  const showPrev = useCallback(() => {
    if (activeIndex === null || images.length === 0) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, showNext, showPrev]);

  return (
    <>
      <Navbar />

      <main>
        <section className="page-banner">
          <div className="wrap">
            <div className="crumb">
              <span className="rule"></span>HOME / GALLERY
            </div>
            <h1>Moments from Her Excellence</h1>
            <p>Photographs from past editions of the Her Excellence Conference &amp; Awards.</p>
          </div>
        </section>

        <section className="section gallery-full">
          <div className="wrap">
            {error && (
              <div className="gallery-note" style={{ margin: '0 0 28px', color: '#dc2626' }}>
                Could not load gallery photographs. Please refresh or try again later.
              </div>
            )}

            {/* Skeleton Loading State for Gallery */}
            {loading && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '16px',
                  marginBottom: '28px',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Skeleton key={n} height={240} borderRadius={8} />
                ))}
              </div>
            )}

            {!loading && images.length === 0 && !error && (
              <div className="gallery-note" style={{ margin: '0 0 28px' }}>
                No photographs available yet.
              </div>
            )}

            {/* Gallery Masonry Grid using Next.js Image */}
            {!loading && (
              <div className="masonry" id="galleryGrid">
                {images.map((img, idx) => {
                  const src = getThumbUrl(img.id, 800);
                  return (
                    <div
                      key={img.id + '-' + idx}
                      className="m-item"
                      onClick={() => openLightbox(idx)}
                      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                    >
                      <Image
                        src={src}
                        alt={img.alt || 'Her Excellence Conference photograph'}
                        width={600}
                        height={400}
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                        unoptimized={src.startsWith('/api/')}
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox Modal with Next.js Image */}
        {activeIndex !== null && images[activeIndex] && (
          <div className="lightbox" id="lightbox" onClick={closeLightbox}>
            <button
              className="lb-close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
            >
              &times;
            </button>
            <button
              className="lb-nav lb-prev"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
            >
              &#8249;
            </button>
            <div
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', width: '1200px', height: '800px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getThumbUrl(images[activeIndex].id, 1600)}
                alt={images[activeIndex].alt || 'Her Excellence photograph'}
                fill
                style={{ objectFit: 'contain' }}
                unoptimized={true}
              />
            </div>
            <button
              className="lb-nav lb-next"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
            >
              &#8250;
            </button>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
