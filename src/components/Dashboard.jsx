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
            <div key={patient.id} className="card patient-card cursor-pointer" onClick={() => onSelectPatient(patient)}>
              <div className="patient-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="avatar" style={{ background: 'var(--primary-glow)' }}>{patient.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{patient.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{patient.age} anos • Nível: {patient.rewards?.level || 'Iniciante'}</span>
                  </div>
                </div>
                {patient.healthScore > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Star size={14} color="#fbbf24" fill={patient.healthScore >= 80 ? "#fbbf24" : "none"} />
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{patient.healthScore}</span>
                  </div>
                )}
              </div>

              <div className="patient-stats">
                <div className="stat-item">
                  <span className="stat-label">Peso</span>
                  <span className="stat-value">{patient.metrics.weight} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>kg</span></span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Gordura Corporal</span>
                  <span className="stat-value text-accent">{patient.metrics.bodyFat} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>%</span></span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Massa Muscular</span>
                  <span className="stat-value text-primary">{patient.metrics.muscleMass} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>kg</span></span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Idade Metabólica</span>
                  <span className="stat-value">{patient.metrics.metabolicAge}</span>
                </div>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span className={`badge ${patient.status === 'Normal' || patient.status === 'Excelente' ? 'badge-success' : 'badge-warning'}`}>
                  <Activity size={14} />
                  {patient.status}
                </span>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  Ver Ficha <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
