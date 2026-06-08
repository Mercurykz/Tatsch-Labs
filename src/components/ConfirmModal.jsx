import React from 'react';

export default function ConfirmModal({ isOpen, title = 'Confirmar', message = '', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', position: 'relative' }}>
        <h3 style={{ margin: 0, color: '#fff', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>Cancelar</button>
          <button onClick={onConfirm} className="btn btn-danger" style={{ padding: '0.5rem 0.9rem' }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
