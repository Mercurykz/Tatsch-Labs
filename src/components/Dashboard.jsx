import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Activity, Star, Plus } from 'lucide-react';
import AddPatientModal from './AddPatientModal';

export default function Dashboard({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Falha ao buscar pacientes');
      }

      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = (newPatient) => {
    setPatients([newPatient, ...patients]);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Meus Pacientes</h1>
          <p>Visão geral de todos os pacientes monitorados ({patients.length})</p>
        </div>
        <div className="search-box" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar paciente..." style={{ paddingLeft: '2.5rem', width: '250px' }} />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={18} /> Novo Paciente
          </button>
        </div>
      </div>

      <AddPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPatientAdded={handlePatientAdded} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Activity className="animate-spin" style={{ marginRight: '1rem' }} /> Carregando pacientes...
        </div>
      ) : patients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          Nenhum paciente cadastrado ainda. Envie uma ficha para começar.
        </div>
      ) : (
        <div className="patient-grid">
          {patients.map(patient => (
            <div
              key={patient.id}
              className="card patient-card cursor-pointer"
              onClick={() => onSelectPatient(patient)}
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="patient-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="avatar" style={{ background: 'var(--primary-glow)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>{patient.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 0.25rem 0' }}>{patient.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{patient.age} anos • {patient.rewards?.level || 'Iniciante'}</span>
                  </div>
                </div>
                {patient.healthScore > 0 && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem 0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Star size={14} color="#fbbf24" fill={patient.healthScore >= 80 ? "#fbbf24" : "none"} />
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{patient.healthScore}</span>
                  </div>
                )}
              </div>

              <div className="patient-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peso</span>
                  <span style={{ display: 'block', color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{patient.metrics.weight || 0} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>kg</span></span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(251, 146, 60, 0.08)', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gordura</span>
                  <span style={{ display: 'block', color: '#fbbf24', fontSize: '1.25rem', fontWeight: 'bold' }}>{patient.metrics.bodyFat || 0} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>%</span></span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Músculo</span>
                  <span style={{ display: 'block', color: '#10b981', fontSize: '1.25rem', fontWeight: 'bold' }}>{patient.metrics.muscleMass || 0} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>kg</span></span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(100, 200, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(100, 200, 255, 0.2)' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Idade Met.</span>
                  <span style={{ display: 'block', color: '#64c8ff', fontSize: '1.25rem', fontWeight: 'bold' }}>{patient.metrics.metabolicAge || 0}</span>
                </div>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  backgroundColor: patient.status === 'Excelente' ? 'rgba(34, 197, 94, 0.2)' : patient.status === 'Normal' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: patient.status === 'Excelente' ? '#22c55e' : patient.status === 'Normal' ? '#3b82f6' : '#f59e0b',
                  border: patient.status === 'Excelente' ? '1px solid rgba(34, 197, 94, 0.5)' : patient.status === 'Normal' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)',
                }}>
                  <Activity size={14} />
                  {patient.status}
                </span>
                <button style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.875rem',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                }}>
                  Ver Ficha
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
