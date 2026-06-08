import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Edit, Pill, Activity, Droplets, Flame, Bone, HeartPulse, Apple, Moon, Award, Syringe, Watch, Calendar, Trophy, Zap, TrendingUp, Star, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EditPatientModal from './EditPatientModal';

export default function PatientProfile({ patient, onBack }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient);

  useEffect(() => {
    setCurrentPatient(patient);
  }, [patient]);

  if (!currentPatient) return null;

  const handlePatientUpdated = (updatedPatient) => {
    setCurrentPatient(updatedPatient);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{new Date(label).toLocaleDateString('pt-BR')}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.9rem' }}>
              {entry.name}: {entry.value} {entry.name === 'Peso' ? 'kg' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (status) => {
    if (status === 'Normal' || status === 'Excelente') return 'var(--success-color, #22c55e)';
    if (status === 'Baixo' || status === 'Elevado' || status === 'Atenção') return 'var(--warning-color, #f59e0b)';
    return 'var(--danger-color, #ef4444)';
  };

  return (
    <div className="animate-fade-in">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>
        <ArrowLeft size={18} /> Voltar para Dashboard
      </button>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-4">
          <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', background: 'var(--primary-glow)' }}>{currentPatient.avatar}</div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-3">
              <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem', margin: 0 }}>{currentPatient.name}</h1>
              {currentPatient.healthScore >= 80 && <span title="Asclépio Score Alto" style={{ color: '#fbbf24' }}><Star size={24} fill="#fbbf24" /></span>}
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem 0' }}>{currentPatient.age} anos • Nível: {currentPatient.rewards?.level || 'Iniciante'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, maxWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Asclépio Score</span>
                  <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>{currentPatient.healthScore || 0}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{
                    width: `${Math.min(currentPatient.healthScore || 0, 100)}%`,
                    height: '100%',
                    background: currentPatient.healthScore >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : currentPatient.healthScore >= 60 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              {currentPatient.healthScore >= 80 && <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.35rem 0.7rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: '600' }}>Excelente</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontWeight: '600' }}
          >
            <Edit size={18} /> Editar Ficha
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontWeight: '600' }}>
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <EditPatientModal
        patient={currentPatient}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPatientUpdated={handlePatientUpdated}
      />

      {/* Navegação por Abas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')} style={tabStyle(activeTab === 'geral')}>
          <Activity size={18} /> Visão Geral
        </button>
        <button className={`tab-btn ${activeTab === 'exames' ? 'active' : ''}`} onClick={() => setActiveTab('exames')} style={tabStyle(activeTab === 'exames')}>
          <Syringe size={18} /> Exames de Sangue
        </button>
        <button className={`tab-btn ${activeTab === 'estilo' ? 'active' : ''}`} onClick={() => setActiveTab('estilo')} style={tabStyle(activeTab === 'estilo')}>
          <Apple size={18} /> Nutrição & Sono
        </button>
        <button className={`tab-btn ${activeTab === 'tratamento' ? 'active' : ''}`} onClick={() => setActiveTab('tratamento')} style={tabStyle(activeTab === 'tratamento')}>
          <Pill size={18} /> Tratamento Médico
        </button>
        <button className={`tab-btn ${activeTab === 'conquistas' ? 'active' : ''}`} onClick={() => setActiveTab('conquistas')} style={tabStyle(activeTab === 'conquistas')}>
          <Award size={18} /> Conquistas
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'geral' && (
          <div className="detail-layout" style={{ gridTemplateColumns: '1fr', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex" style={{ flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card glass-panel">
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity className="text-primary" size={20} /> Indicadores Atuais (Fitdays)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <StatItem icon={<Activity size={16} />} label="IMC" value={currentPatient.metrics?.bmi || 'N/A'} />
                  <StatItem icon={<Flame size={16} className="text-accent" />} label="Gordura" value={`${currentPatient.metrics?.bodyFat || 'N/A'}${typeof currentPatient.metrics?.bodyFat === 'number' ? '%' : ''}`} color="text-accent" />
                  <StatItem icon={<HeartPulse size={16} className="text-primary" />} label="Músculo" value={`${currentPatient.metrics?.muscleMass || 'N/A'}${typeof currentPatient.metrics?.muscleMass === 'number' ? ' kg' : ''}`} color="text-primary" />
                  <StatItem icon={<Droplets size={16} className="text-accent" />} label="Água" value={`${currentPatient.metrics?.water || 'N/A'}${typeof currentPatient.metrics?.water === 'number' ? '%' : ''}`} />
                  <StatItem icon={<Bone size={16} style={{ color: '#fbbf24' }} />} label="Massa Óssea" value={`${currentPatient.metrics?.boneMass || 'N/A'}${typeof currentPatient.metrics?.boneMass === 'number' ? ' kg' : ''}`} />
                  <StatItem icon={<Activity size={16} style={{ color: '#f43f5e' }} />} label="Metabolismo" value={`${currentPatient.metrics?.bmr || 'N/A'}${typeof currentPatient.metrics?.bmr === 'number' ? ' kcal' : ''}`} />
                </div>
              </div>
              <div className="card glass-panel">
                <h3 style={{ marginBottom: '1rem' }}>Evolução de Composição Corporal</h3>
                <div className="chart-container" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patient.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-muted)" tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', {month: 'short', day: 'numeric'})} />
                      <YAxis yAxisId="left" stroke="var(--text-muted)" />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
                      <Tooltip content={<CustomTooltip />} />
                      <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#f8fafc" strokeWidth={3} activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="Gordura %" stroke="var(--accent-color)" strokeWidth={3} />
                      <Line yAxisId="left" type="monotone" dataKey="muscleMass" name="Músculo" stroke="var(--primary-color)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exames' && (
          <div className="card glass-panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex justify-between items-center flex-wrap" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Syringe className="text-primary" size={20} /> Análise de Marcadores Sanguíneos
              </h3>
              <select className="input-field" style={{ width: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                <option>Comparar: Últimos 2 exames</option>
                <option>Todos os históricos</option>
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {patient.exams && patient.exams[0] ? Object.entries(patient.exams[0]).map(([key, data]) => {
                if (key === 'date') return null;
                const prevExam = patient.exams[1] ? patient.exams[1][key] : null;
                const labelMap = { b12: 'Vitamina B12', cortisol: 'Cortisol', ferritin: 'Ferritina', fastingGlucose: 'Glicemia de Jejum' };
                
                return (
                  <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{labelMap[key] || key}</span>
                      <span className="badge" style={{ background: getStatusColor(data.status), color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>{data.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{data.value}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{data.unit}</span>
                    </div>
                    {prevExam && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Anterior: {prevExam.value} {prevExam.unit}</span>
                        {data.value > prevExam.value ? <TrendingUp size={14} style={{ color: 'var(--danger-color)' }}/> : <TrendingUp size={14} style={{ color: 'var(--success-color)', transform: 'rotate(180deg)' }}/>}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                  Nenhum exame registrado.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'estilo' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Apple className="text-primary" size={20} /> Análise Nutricional
              </h3>
              {patient.nutrition ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{patient.nutrition.dailyCalories}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kcal Consumidas</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{patient.nutrition.qualityScore}/100</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Índice Qualidade</div>
                    </div>
                  </div>
                  
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Distribuição de Macronutrientes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <MacroBar label="Carboidratos" value={patient.nutrition.macros.carbs.value} percent={patient.nutrition.macros.carbs.percentage} color="#3b82f6" />
                    <MacroBar label="Proteínas" value={patient.nutrition.macros.protein.value} percent={patient.nutrition.macros.protein.percentage} color="#10b981" />
                    <MacroBar label="Gorduras" value={patient.nutrition.macros.fat.value} percent={patient.nutrition.macros.fat.percentage} color="#f59e0b" />
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Sem dados nutricionais.</div>
              )}
            </div>

            <div className="card glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Watch className="text-accent" size={20} /> Wearables & Estilo de Vida
              </h3>
              {patient.lifestyle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                      <Moon size={24} color="#8b5cf6" />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>Sono ({patient.lifestyle.sleep.device})</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qualidade: {patient.lifestyle.sleep.quality}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{patient.lifestyle.sleep.averageHours}h <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ noite</span></div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ec4899' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                      <Activity size={24} color="#ec4899" />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>Atividade ({patient.lifestyle.activity.device})</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Média diária</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{patient.lifestyle.activity.averageSteps}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Passos</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{patient.lifestyle.activity.activeMinutes}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Min. Ativos</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Sem dados de estilo de vida.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tratamento' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield className="text-danger" size={20} /> Medicamentos Contínuos
              </h3>
              {patient.medications && patient.medications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {patient.medications.map((med, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>{med.name}</div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Syringe size={14} />{med.dose}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} />{med.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                  Nenhum medicamento registrado.
                </div>
              )}
            </div>

            <div className="card glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill className="text-primary" size={20} /> Protocolo de Suplementação
              </h3>
              <div className="vitamin-list">
                {patient.vitamins && patient.vitamins.length > 0 ? patient.vitamins.map((vit, idx) => (
                  <div key={idx} className="vitamin-item">
                    <div className="vitamin-icon"><Pill size={20} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                        <h4 style={{ color: '#fff', margin: 0 }}>{vit.name}</h4>
                        <span className={`badge ${vit.priority === 'High' ? 'badge-danger' : vit.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                          {vit.priority === 'High' ? 'Alta' : vit.priority === 'Medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Dose: {vit.dose}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{vit.reason}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Nenhuma vitamina prescrita.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conquistas' && (
          <div className="card glass-panel" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--primary-glow)', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}>
                <Trophy size={56} color="var(--primary-color)" />
              </div>
              <div>
                <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{patient.rewards?.points || 0} Pontos</h2>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Nível Atual: <strong style={{ color: 'var(--accent-color)' }}>{patient.rewards?.level || 'Iniciante'}</strong>
                </div>
              </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Badges Desbloqueadas</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {patient.rewards?.badges ? patient.rewards.badges.map((badge, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Star size={18} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>{badge}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)' }}>Nenhuma badge desbloqueada.</div>
              )}
            </div>
            
            <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.2)', textAlign: 'left' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <Zap size={20} color="#f59e0b" fill="#f59e0b" /> Próxima Recompensa
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                Atingindo 5000 pontos, você desbloqueia 1 retorno gratuito ou 15% de desconto na próxima suplementação. Faltam <strong style={{color: '#fff'}}>{5000 - (patient.rewards?.points || 0)} pontos</strong>.
              </p>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', marginTop: '1.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${((patient.rewards?.points || 0) / 5000) * 100}%`, background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', height: '100%', borderRadius: '6px' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers components
const StatItem = ({ icon, label, value, color }) => (
  <div className="stat-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <div style={{ marginBottom: '0.5rem' }}>{icon}</div>
    <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</span>
    <span className={`stat-value ${color || ''}`} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</span>
  </div>
);

const MacroBar = ({ label, value, percent, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
      <span style={{ color: '#fff', fontWeight: 500 }}>{label}</span>
      <span style={{ color: 'var(--text-muted)' }}>{value}g ({percent}%)</span>
    </div>
    <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, background: color, height: '100%', borderRadius: '5px' }}></div>
    </div>
  </div>
);

const tabStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  background: isActive ? 'var(--primary-glow)' : 'transparent',
  color: isActive ? '#fff' : 'var(--text-muted)',
  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: isActive ? '600' : 'normal',
  whiteSpace: 'nowrap',
  outline: 'none'
});
