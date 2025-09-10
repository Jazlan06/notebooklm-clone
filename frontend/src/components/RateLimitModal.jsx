import React from 'react';

export default function RateLimitModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white', padding: 20, borderRadius: 8,
        maxWidth: 400, textAlign: 'center',
      }}>
        <h2>Rate Limit Reached</h2>
        <p>You have made too many requests in a short time. Please wait a moment before trying again.</p>
        <button onClick={onClose} style={{ padding: '8px 16px', marginTop: 10 }}>
          OK
        </button>
      </div>
    </div>
  );
}
