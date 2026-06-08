import { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function EditPatientModal({ patient, isOpen, onClose, onPatientUpdated }) {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    age: patient?.age || '',
    status: patient?.status || 'Normal',
    healthScore: patient?.healthScore || 0,
    metrics: {
      weight: patient?.metrics?.weight || 0,
      bodyFat: patient?.metrics?.bodyFat || 0,
      muscleMass: patient?.metrics?.muscleMass || 0,
      metabolicAge: patient?.metrics?.metabolicAge || 0,
      bmi: patient?.metrics?.bmi || 0,
      water: patient?.metrics?.water || 0,
      boneMass: patient?.metrics?.boneMass || 0,
      bmr: patient?.metrics?.bmr || 0,
    },
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

  const handleMetricChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      metrics: {
        ...formData.metrics,
        [name]: parseFloat(value) || 0,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.age) {
      setError('Nome e idade são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao atualizar paciente');
      }

      const updatedPatient = await response.json();
      if (onPatientUpdated) onPatientUpdated(updatedPatient);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError(err.message || 'Falha ao atualizar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

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
      overflowY: 'auto',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '600px',
        padding: '2rem',
        position: 'relative',
        margin: '2rem auto',
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

        <h2 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.5rem' }}>Editar Ficha - {patient.name}</h2>

        <form onSubmit={handleSubmit}>
          {/* Seção: Informações Básicas */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Informações Básicas
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
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
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Idade *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  Escore de Saúde (0-100)
                </label>
                <input
                  type="number"
                  name="healthScore"
                  value={formData.healthScore}
                  onChange={handleChange}
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
          </div>

          {/* Seção: Métricas Corporais */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Métricas Corporais
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.metrics.weight}
                  onChange={handleMetricChange}
                  step="0.1"
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
                  Gordura Corporal (%)
                </label>
                <input
                  type="number"
                  name="bodyFat"
                  value={formData.metrics.bodyFat}
                  onChange={handleMetricChange}
                  step="0.1"
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
                  Massa Muscular (kg)
                </label>
                <input
                  type="number"
                  name="muscleMass"
                  value={formData.metrics.muscleMass}
                  onChange={handleMetricChange}
                  step="0.1"
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
                  Idade Metabólica
                </label>
                <input
                  type="number"
                  name="metabolicAge"
                  value={formData.metrics.metabolicAge}
                  onChange={handleMetricChange}
                  step="0.1"
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
                  IMC
                </label>
                <input
                  type="number"
                  name="bmi"
                  value={formData.metrics.bmi}
                  onChange={handleMetricChange}
                  step="0.1"
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
                  Água Corporal (%)
                </label>
                <input
                  type="number"
                  name="water"
                  value={formData.metrics.water}
                  onChange={handleMetricChange}
                  step="0.1"
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
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
