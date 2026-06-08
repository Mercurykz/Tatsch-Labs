import React, { useState, useEffect } from 'react';
import { X, Pill, Save } from 'lucide-react';

export default function TreatmentModal({ isOpen, onClose, onSave, editingMed }) {
  const [form, setForm] = useState({ name: '', dose: '', frequency: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMed) {
      setForm({
        name: editingMed.name || '',
        dose: editingMed.dose || '',
        frequency: editingMed.frequency || '',
        notes: editingMed.notes || '',
      });
    } else {
      setForm({ name: '', dose: '', frequency: '', notes: '' });
    }
    setError('');
  }, [isOpen, editingMed]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nome do medicamento é obrigatório.'); return; }
    if (!form.dose.trim()) { setError('Dose é obrigatória.'); return; }
    if (!form.frequency.trim()) { setError('Frequência é obrigatória.'); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  };

  const modalStyle = {
    background: 'var(--bg-card, #1a1f2e)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    animation: 'fadeInUp 0.2s ease',
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.25)',
    color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = { display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted, #94a3b8)' };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#fff' }}>
            <Pill size={20} style={{ color: 'var(--primary-color, #3b82f6)' }} />
            {editingMed ? 'Editar Medicamento' : 'Adicionar Medicamento'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={labelStyle}>
            Nome do Medicamento *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Metformina, Levotiroxina..."
              style={inputStyle}
              autoFocus
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label style={labelStyle}>
              Dose *
              <input
                name="dose"
                value={form.dose}
                onChange={handleChange}
                placeholder="Ex: 500mg"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Frequência *
              <input
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                placeholder="Ex: 1x ao dia"
                style={inputStyle}
              />
            </label>
          </div>

          <label style={labelStyle}>
            Observações
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Observações adicionais (opcional)..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </label>

          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', color: '#fecaca', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
