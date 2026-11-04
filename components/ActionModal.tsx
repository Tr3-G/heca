'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertTriangle, X, Loader2, Info } from 'lucide-react';

export interface ActionModalProps {
  isOpen: boolean;
  type: 'confirm' | 'success' | 'error' | 'image-preview';
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  loading?: boolean;
  imageSrc?: string;
  imageName?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function ActionModal({
  isOpen,
  type,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  loading = false,
  imageSrc,
  imageName,
  onConfirm,
  onClose,
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 7, 21, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: type === 'image-preview' ? '820px' : '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(200, 160, 77, 0.4)',
          position: 'relative',
          padding: type === 'image-preview' ? '20px' : '32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* IMAGE PREVIEW MODAL */}
        {type === 'image-preview' && imageSrc && (
          <div>
            <div style={{ marginBottom: '14px', paddingRight: '28px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--plum-950)' }}>
                {title || imageName || 'Photograph Preview'}
              </h3>
              {message && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{message}</p>}
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '520px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#170715',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={imageSrc}
                alt={title || 'Photograph Preview'}
                fill
                style={{ objectFit: 'contain' }}
                unoptimized={imageSrc.startsWith('/api/')}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #eee',
              }}
            >
              <span style={{ fontSize: '12.5px', color: '#777' }}>
                {imageName || 'Her Excellence Conference photograph'}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={imageSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  Open Full File
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-gold"
                  style={{ padding: '6px 16px', fontSize: '13px' }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM MODAL (DELETE OR DANGEROUS ACTION) */}
        {type === 'confirm' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: isDangerous ? '#fee2e2' : 'rgba(200, 160, 77, 0.15)',
                color: isDangerous ? '#dc2626' : 'var(--plum-950)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: 'var(--plum-950)' }}>
              {title}
            </h3>
            {message && (
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
                {message}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                style={{
                  padding: '10px 22px',
                  borderRadius: '6px',
                  background: isDangerous ? '#dc2626' : 'var(--plum-950)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS MODAL */}
        {type === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '22px', color: 'var(--plum-950)' }}>
              {title}
            </h3>
            {message && (
              <p style={{ margin: '0 0 24px', fontSize: '14.5px', color: '#475569', lineHeight: 1.5 }}>
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-gold"
              style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}
            >
              {confirmLabel || 'Continue'}
            </button>
          </div>
        )}

        {/* ERROR MODAL */}
        {type === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#991b1b' }}>
              {title || 'Action Failed'}
            </h3>
            {message && (
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
