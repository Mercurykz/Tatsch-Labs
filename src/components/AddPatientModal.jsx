import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    avatar: '',
    status: 'Normal',
    healthScore: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' || name === 'healthScore' ? parseInt(value, 10) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.age || !formData.avatar) {
      setError('Nome, idade e avatar são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao criar paciente');
      }

      const newPatient = await response.json();
      setFormData({ name: '', age: '', avatar: '', status: 'Normal', healthScore: 0 });
      if (onPatientAdded) onPatientAdded(newPatient);
      onClose();
    } catch (err) {
      console.error('Erro ao criar paciente:', err);
      setError(err.message || 'Falha ao criar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2rem',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.5rem',
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.5rem' }}>Adicionar Novo Paciente</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nome *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Gabriel Silva"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Idade *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Ex: 34"
                min="0"
                max="150"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Avatar (2 letras) *
              </label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="Ex: GS"
                maxLength="2"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                }}
              >
                <option value="Normal" style={{ background: '#1a1a2e', color: '#fff' }}>Normal</option>
                <option value="Alerta" style={{ background: '#1a1a2e', color: '#fff' }}>Alerta</option>
                <option value="Excelente" style={{ background: '#1a1a2e', color: '#fff' }}>Excelente</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Escore de Saúde
              </label>
              <input
                type="number"
                name="healthScore"
                value={formData.healthScore}
                onChange={handleChange}
                placeholder="0-100"
                min="0"
                max="100"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--primary-color)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Plus size={18} /> {loading ? 'Criando...' : 'Criar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
