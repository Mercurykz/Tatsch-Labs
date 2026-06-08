import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Activity, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          patient_metrics (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      const formattedPatients = data.map(p => {
        // Pega as métricas mais recentes, se houver
        const latestMetrics = p.patient_metrics && p.patient_metrics.length > 0 
          ? p.patient_metrics.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          : { weight: '--', body_fat: '--', muscle_mass: '--', metabolic_age: '--' };

        return {
          id: p.id,
          name: p.name,
          age: p.age,
          avatar: p.avatar,
          status: p.status,
          healthScore: p.health_score,
          lastUpdate: p.updated_at,
          rewards: {
            level: p.rewards_level,
            points: p.rewards_points
          },
          metrics: {
            weight: latestMetrics.weight,
            bodyFat: latestMetrics.body_fat,
            muscleMass: latestMetrics.muscle_mass,
            metabolicAge: latestMetrics.metabolic_age
          }
        };
      });

      setPatients(formattedPatients);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Meus Pacientes</h1>
          <p>Visão geral de todos os pacientes monitorados ({patients.length})</p>
        </div>
        <div className="search-box">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar paciente..." style={{ paddingLeft: '2.5rem', width: '250px' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Activity className="animate-spin" style={{ marginRight: '1rem' }} /> Carregando pacientes do Supabase...
        </div>
      ) : patients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          Nenhum paciente cadastrado ainda. (Lembre-se de rodar o código SQL no Supabase!)
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
