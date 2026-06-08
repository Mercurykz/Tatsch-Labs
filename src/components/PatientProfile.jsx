import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Edit, Pill, Activity, Droplets, Flame, Bone, HeartPulse, Apple, Moon, Award, Syringe, Watch, Calendar, Trophy, Zap, TrendingUp, Star, Shield, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EditPatientModal from './EditPatientModal';
import ConfirmModal from './ConfirmModal';
import TreatmentModal from './TreatmentModal';

export default function PatientProfile({ patient, onBack }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient);
  const [patientUploads, setPatientUploads] = useState([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedExamIndex, setSelectedExamIndex] = useState(0);
  const [newExam, setNewExam] = useState({
    date: '',
    b12: '',
    cortisol: '',
    ferritin: '',
    fastingGlucose: '',
  });
  const [examMessage, setExamMessage] = useState('');
  const [examError, setExamError] = useState('');
  const [isAddingExam, setIsAddingExam] = useState(false);
  const uploadInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editExamData, setEditExamData] = useState(null);
  const [editOriginalDate, setEditOriginalDate] = useState(null);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [isDeletingExam, setIsDeletingExam] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'delete' | 'add' | 'saveEdit'

  useEffect(() => {
    setCurrentPatient(patient);
  }, [patient]);

  const sortedExams = currentPatient?.exams
    ? [...currentPatient.exams].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  useEffect(() => {
    if (sortedExams.length > 0) {
      setSelectedExamIndex(0);
    } else {
      setSelectedExamIndex(-1);
    }
  }, [sortedExams.length]);

  useEffect(() => {
    if (currentPatient?.id) {
      fetchPatientUploads(currentPatient.id);
    }
  }, [currentPatient?.id]);

  if (!currentPatient) return null;

  const handlePatientUpdated = (updatedPatient) => {
    setCurrentPatient(updatedPatient);
  };

  const fetchPatientUploads = async (patientId) => {
    setIsLoadingUploads(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/uploads`);
      if (!response.ok) {
        setPatientUploads([]);
        return;
      }
      const data = await response.json();
      setPatientUploads(data);
    } catch (error) {
      console.error('Erro ao buscar documentos do paciente:', error);
      setPatientUploads([]);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!file || !currentPatient?.id) return;
    setUploadError('');
    setUploadMessage('');
    setIsUploadingDoc(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', currentPatient.id);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Falha ao enviar o documento.');
      }

      await response.json();
      setUploadMessage('Documento enviado com sucesso!');
      fetchPatientUploads(currentPatient.id);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      setUploadError(error.message || 'Falha no upload do documento.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDocumentChange = async (e) => {
    const file = e.target.files?.[0];
    await handleDocumentUpload(file);
    e.target.value = '';
  };

  const handleDocumentButtonClick = () => {
    uploadInputRef.current?.click();
  };

  const getExamStatus = (key, value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return 'N/A';

    switch (key) {
      case 'b12':
        return num < 200 ? 'Baixo' : num > 900 ? 'Atenção' : 'Normal';
      case 'cortisol':
        return num < 6 ? 'Baixo' : num > 18 ? 'Elevado' : 'Normal';
      case 'ferritin':
        return num < 30 ? 'Baixo' : num > 200 ? 'Atenção' : 'Normal';
      case 'fastingGlucose':
        return num < 70 ? 'Baixo' : num > 100 ? 'Atenção' : 'Normal';
      default:
        return 'Normal';
    }
  };

  const handleNewExamChange = (e) => {
    const { name, value } = e.target;
    setNewExam((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [parsedCSVExams, setParsedCSVExams] = useState([]);
  const [csvImportMessage, setCsvImportMessage] = useState('');

  const parseCSVText = (text) => {
    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const next = line[i + 1];
        if (ch === '"') {
          if (inQuotes && next === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
          continue;
        }
        if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; continue; }
        cur += ch;
      }
      result.push(cur);
      return result.map(s => s.trim());
    };

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { valid: [], invalid: [{ line: 0, reason: 'CSV vazio ou sem cabeçalho' }] };
    const rawHeaders = parseLine(lines[0]).map(h => h.trim());
    const headers = rawHeaders.map(h => h.toLowerCase());
    const rows = lines.slice(1).map(l => parseLine(l));

    const valid = [];
    const invalid = [];

    rows.forEach((cols, idx) => {
      const rowNum = idx + 2;
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });

      const dateRaw = obj.date || obj.data || new Date().toISOString();
      const b12Raw = obj.b12 || obj['vitamina_b12'] || obj['b12(pg/ml)'] || '';
      const cortisolRaw = obj.cortisol || '';
      const ferritinRaw = obj.ferritin || obj.ferritina || '';
      const fastingRaw = obj.fastingglucose || obj.glicemia || obj.gly || obj['glicemia_jejum'] || '';

      const parsedDate = new Date(dateRaw);
      const b12 = parseFloat(String(b12Raw).replace(/[^0-9.\-]/g, ''));
      const cortisol = parseFloat(String(cortisolRaw).replace(/[^0-9.\-]/g, ''));
      const ferritin = parseFloat(String(ferritinRaw).replace(/[^0-9.\-]/g, ''));
      const fasting = parseFloat(String(fastingRaw).replace(/[^0-9.\-]/g, ''));

      const rowErrors = [];
      if (Number.isNaN(parsedDate.getTime())) rowErrors.push('data inválida');
      if (Number.isNaN(b12)) rowErrors.push('b12 inválido');
      if (Number.isNaN(cortisol)) rowErrors.push('cortisol inválido');
      if (Number.isNaN(ferritin)) rowErrors.push('ferritina inválida');
      if (Number.isNaN(fasting)) rowErrors.push('glicemia inválida');

      if (rowErrors.length) {
        invalid.push({ line: rowNum, errors: rowErrors, raw: cols.join(',') });
      } else {
        valid.push({
          date: parsedDate.toISOString(),
          b12: { value: b12, unit: 'pg/mL', status: getExamStatus('b12', b12) },
          cortisol: { value: cortisol, unit: 'mcg/dL', status: getExamStatus('cortisol', cortisol) },
          ferritin: { value: ferritin, unit: 'ng/mL', status: getExamStatus('ferritin', ferritin) },
          fastingGlucose: { value: fasting, unit: 'mg/dL', status: getExamStatus('fastingGlucose', fasting) },
        });
      }
    });

    return { valid, invalid };
  };

  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const { valid, invalid } = parseCSVText(text);
        if (valid.length === 0) {
          setParsedCSVExams({ valid: [], invalid });
          setCsvImportMessage('Nenhuma linha válida encontrada no CSV.');
          setConfirmAction('importCSV');
          setConfirmOpen(true);
          return;
        }
        setParsedCSVExams({ valid, invalid });
        setConfirmAction('importCSV');
        setConfirmOpen(true);
      } catch (err) {
        console.error('Erro parse CSV', err);
        setCsvImportMessage('Erro ao ler o CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const importCSVExams = async () => {
    if (!parsedCSVExams || !parsedCSVExams.valid || parsedCSVExams.valid.length === 0) return;
    const updatedExams = [...parsedCSVExams.valid, ...(currentPatient.exams || [])];
    try {
      const response = await fetch(`/api/patients/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentPatient.name,
          age: currentPatient.age,
          avatar: currentPatient.avatar,
          status: currentPatient.status,
          healthScore: currentPatient.healthScore,
          metrics: currentPatient.metrics,
          exams: updatedExams,
        }),
      });
      if (!response.ok) throw new Error('Falha ao importar CSV');
      const updatedPatient = await response.json();
      setCurrentPatient(updatedPatient);
      const invalidCount = parsedCSVExams.invalid ? parsedCSVExams.invalid.length : 0;
      setParsedCSVExams([]);
      setCsvImportMessage(`Importação concluída. Linhas inválidas: ${invalidCount}`);
    } catch (err) {
      console.error('Erro importar CSV', err);
      setCsvImportMessage('Falha ao importar CSV.');
    }
  };

  const parseValuesFromFilename = (filename) => {
    const lower = filename.toLowerCase();
    const patterns = {
      b12: /b12[_\- ]?(\d{2,4}(?:\.\d+)?)/i,
      cortisol: /cort(?:isol)?[_\- ]?(\d{1,3}(?:\.\d+)?)/i,
      ferritin: /ferr(?:itin|itin)?[_\- ]?(\d{1,4}(?:\.\d+)?)/i,
      fastingGlucose: /(?:glu|glicemia|fasting)[_\- ]?(\d{1,3}(?:\.\d+)?)/i,
    };
    const out = {};
    for (const k of Object.keys(patterns)) {
      const m = lower.match(patterns[k]);
      if (m) out[k] = m[1];
    }
    return out;
  };

  const handlePrefillFromUpload = (uploadId) => {
    const doc = patientUploads.find(u => u.id === uploadId);
    if (!doc) return;
    const parsed = parseValuesFromFilename(doc.filename);
    const date = new Date(doc.created_at).toISOString().slice(0,10);
    setNewExam((prev) => ({ ...prev, date, b12: parsed.b12 || prev.b12, cortisol: parsed.cortisol || prev.cortisol, ferritin: parsed.ferritin || prev.ferritin, fastingGlucose: parsed.fastingGlucose || prev.fastingGlucose }));
  };

  const handleAddExam = async () => {
    setExamMessage('');
    setExamError('');

    if (!newExam.date) {
      setExamError('Informe a data do exame.');
      return;
    }

    const missingField = ['b12', 'cortisol', 'ferritin', 'fastingGlucose'].find((field) => !newExam[field]);
    if (missingField) {
      setExamError('Preencha todos os campos do exame.');
      return;
    }

    setIsAddingExam(true);

    const examItem = {
      date: newExam.date,
      b12: { value: parseFloat(newExam.b12), unit: 'pg/mL', status: getExamStatus('b12', newExam.b12) },
      cortisol: { value: parseFloat(newExam.cortisol), unit: 'mcg/dL', status: getExamStatus('cortisol', newExam.cortisol) },
      ferritin: { value: parseFloat(newExam.ferritin), unit: 'ng/mL', status: getExamStatus('ferritin', newExam.ferritin) },
      fastingGlucose: { value: parseFloat(newExam.fastingGlucose), unit: 'mg/dL', status: getExamStatus('fastingGlucose', newExam.fastingGlucose) },
    };

    const updatedExams = [examItem, ...(currentPatient.exams || [])];

    try {
      const response = await fetch(`/api/patients/${currentPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentPatient.name,
          age: currentPatient.age,
          avatar: currentPatient.avatar,
          status: currentPatient.status,
          healthScore: currentPatient.healthScore,
          metrics: currentPatient.metrics,
          exams: updatedExams,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Falha ao adicionar o exame.');
      }

      const updatedPatient = await response.json();
      setCurrentPatient(updatedPatient);
      setExamMessage('Exame adicionado com sucesso!');
      setNewExam({ date: '', b12: '', cortisol: '', ferritin: '', fastingGlucose: '' });
    } catch (error) {
      console.error('Erro ao adicionar exame:', error);
      setExamError(error.message || 'Falha ao adicionar o exame.');
    } finally {
      setIsAddingExam(false);
    }
  };

  const handleEditClick = (idx) => {
    const exam = sortedExams[idx];
    if (!exam) return;
    setEditOriginalDate(exam.date);
    setEditExamData({
      date: exam.date,
      b12: exam.b12?.value ?? '',
      cortisol: exam.cortisol?.value ?? '',
      ferritin: exam.ferritin?.value ?? '',
      fastingGlucose: exam.fastingGlucose?.value ?? '',
    });
    setEditMode(true);
    setSelectedExamIndex(idx);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditExamData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditExamData(null);
    setEditOriginalDate(null);
  };

  const handleSaveEdit = async () => {
    if (!editExamData || !editExamData.date) {
      return;
    }

    const editedExam = {
      date: editExamData.date,
      b12: { value: parseFloat(editExamData.b12), unit: 'pg/mL', status: getExamStatus('b12', editExamData.b12) },
      cortisol: { value: parseFloat(editExamData.cortisol), unit: 'mcg/dL', status: getExamStatus('cortisol', editExamData.cortisol) },
      ferritin: { value: parseFloat(editExamData.ferritin), unit: 'ng/mL', status: getExamStatus('ferritin', editExamData.ferritin) },
      fastingGlucose: { value: parseFloat(editExamData.fastingGlucose), unit: 'mg/dL', status: getExamStatus('fastingGlucose', editExamData.fastingGlucose) },
    };

    const updatedExams = (currentPatient.exams || []).map((e) => (e.date === editOriginalDate ? editedExam : e));

    try {
      const response = await fetch(`/api/patients/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentPatient.name,
          age: currentPatient.age,
          avatar: currentPatient.avatar,
          status: currentPatient.status,
          healthScore: currentPatient.healthScore,
          metrics: currentPatient.metrics,
          exams: updatedExams,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Falha ao salvar o exame.');
      }

      const updatedPatient = await response.json();
      setCurrentPatient(updatedPatient);
      setEditMode(false);
      setEditExamData(null);
      setEditOriginalDate(null);
      setSelectedExamIndex(0);
    } catch (err) {
      console.error('Erro ao salvar edição de exame:', err);
    }
  };

  const handleDeleteClick = (idx) => {
    const exam = sortedExams[idx];
    if (!exam) return;
    setExamToDelete(exam);
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    setIsDeletingExam(true);
    const updatedExams = (currentPatient.exams || []).filter((e) => e.date !== examToDelete.date);

    try {
      const response = await fetch(`/api/patients/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentPatient.name,
          age: currentPatient.age,
          avatar: currentPatient.avatar,
          status: currentPatient.status,
          healthScore: currentPatient.healthScore,
          metrics: currentPatient.metrics,
          exams: updatedExams,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Falha ao excluir o exame.');
      }

      const updatedPatient = await response.json();
      setCurrentPatient(updatedPatient);
      setConfirmOpen(false);
      setExamToDelete(null);
      setSelectedExamIndex(0);
    } catch (err) {
      console.error('Erro ao excluir exame:', err);
    } finally {
      setIsDeletingExam(false);
    }
  };

  const performConfirmAction = async () => {
    if (confirmAction === 'delete') {
      await confirmDeleteExam();
    } else if (confirmAction === 'add') {
      // close modal first to show add progress in UI
      setConfirmOpen(false);
      await handleAddExam();
    } else if (confirmAction === 'saveEdit') {
      setConfirmOpen(false);
      await handleSaveEdit();
    }
    setConfirmAction(null);
    setConfirmOpen(false);
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

  const examLabelMap = {
    b12: 'Vitamina B12',
    cortisol: 'Cortisol',
    ferritin: 'Ferritina',
    fastingGlucose: 'Glicemia de Jejum',
    cholesterol: 'Colesterol',
    hdl: 'HDL',
    ldl: 'LDL',
    triglicerides: 'Triglicerídeos',
  };

  const selectedExam = sortedExams[selectedExamIndex] || null;

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
        <button className={`tab-btn ${activeTab === 'documentos' ? 'active' : ''}`} onClick={() => setActiveTab('documentos')} style={tabStyle(activeTab === 'documentos')}>
          <FileText size={18} /> Documentos
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
                    <LineChart data={currentPatient.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Syringe className="text-primary" size={20} /> Análise de Marcadores Sanguíneos
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
                  Visualize o exame mais recente e compare com o histórico anterior.
                </p>
              </div>
              <select className="input-field" style={{ width: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                <option>Últimos exames</option>
                <option>Todos os históricos</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Registrar exame rápido</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preencha apenas os principais marcadores para gerar o histórico.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setConfirmAction('add'); setConfirmOpen(true); }}
                  disabled={isAddingExam}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.15rem', minWidth: '160px' }}
                >
                  {isAddingExam ? 'Salvando...' : 'Adicionar Exame'}
                </button>
              </div>
              {examMessage && (
                <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#a7f3d0' }}>
                  {examMessage}
                </div>
              )}
              {examError && (
                <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.12)', color: '#fecaca' }}>
                  {examError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  Data do exame
                  <input
                    type="date"
                    name="date"
                    value={newExam.date}
                    onChange={handleNewExamChange}
                    className="input-field"
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  B12 (pg/mL)
                  <input
                    type="number"
                    name="b12"
                    value={newExam.b12}
                    onChange={handleNewExamChange}
                    step="0.1"
                    className="input-field"
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  Cortisol (mcg/dL)
                  <input
                    type="number"
                    name="cortisol"
                    value={newExam.cortisol}
                    onChange={handleNewExamChange}
                    step="0.1"
                    className="input-field"
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  Ferritina (ng/mL)
                  <input
                    type="number"
                    name="ferritin"
                    value={newExam.ferritin}
                    onChange={handleNewExamChange}
                    step="0.1"
                    className="input-field"
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  Glicemia Jejum (mg/dL)
                  <input
                    type="number"
                    name="fastingGlucose"
                    value={newExam.fastingGlucose}
                    onChange={handleNewExamChange}
                    step="0.1"
                    className="input-field"
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                <input type="file" accept=".csv" id="csv-input" style={{ display: 'none' }} onChange={handleCSVFileChange} />
                <label htmlFor="csv-input" className="btn btn-secondary" style={{ padding: '0.55rem 0.9rem', cursor: 'pointer' }}>Importar CSV</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select onChange={(e) => handlePrefillFromUpload(e.target.value)} defaultValue="" style={{ padding: '0.55rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <option value="">Preencher do PDF</option>
                    {patientUploads.map((u) => (<option key={u.id} value={u.id}>{u.filename}</option>))}
                  </select>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{csvImportMessage}</span>
                </div>
              </div>
            </div>

            {sortedExams.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {sortedExams.map((exam, idx) => (
                    <button
                      key={exam.date}
                      onClick={() => setSelectedExamIndex(idx)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '999px',
                        border: selectedExamIndex === idx ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(255,255,255,0.08)',
                        background: selectedExamIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: selectedExamIndex === idx ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: selectedExamIndex === idx ? 600 : 500,
                      }}
                    >
                      {new Date(exam.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Exame selecionado</span>
                    <h4 style={{ color: '#fff', margin: '0.25rem 0 0 0' }}>{selectedExam ? new Date(selectedExam.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Sem exame'}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ padding: '0.55rem 0.9rem', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', fontWeight: 600 }}>Total de exames: {sortedExams.length}</span>
                      <span style={{ padding: '0.55rem 0.9rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', fontWeight: 600 }}>
                        Último status: {selectedExam ? selectedExam.status || 'N/A' : 'N/A'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                        <button onClick={() => handleEditClick(selectedExamIndex)} className="btn btn-secondary" style={{ padding: '0.45rem 0.7rem' }}>Editar</button>
                        <button onClick={() => handleDeleteClick(selectedExamIndex)} className="btn btn-danger" style={{ padding: '0.45rem 0.7rem' }}>Excluir</button>
                      </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {editMode && editExamData ? (
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                        <input type="date" name="date" value={editExamData.date} onChange={handleEditChange} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }} />
                        <input type="number" name="b12" value={editExamData.b12} onChange={handleEditChange} placeholder="B12" style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }} />
                        <input type="number" name="cortisol" value={editExamData.cortisol} onChange={handleEditChange} placeholder="Cortisol" style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }} />
                        <input type="number" name="ferritin" value={editExamData.ferritin} onChange={handleEditChange} placeholder="Ferritina" style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button onClick={handleCancelEdit} className="btn btn-secondary">Cancelar</button>
                          <button onClick={() => { setConfirmAction('saveEdit'); setConfirmOpen(true); }} className="btn btn-primary">Salvar</button>
                      </div>
                    </div>
                  ) : selectedExam ? Object.entries(selectedExam).filter(([key]) => key !== 'date').map(([key, data]) => {
                    const prevExam = sortedExams[selectedExamIndex + 1] ? sortedExams[selectedExamIndex + 1][key] : null;

                    return (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{examLabelMap[key] || key}</span>
                          <span className="badge" style={{ background: getStatusColor(data.status), color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>{data.status || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{data.value ?? 'N/A'}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{data.unit || ''}</span>
                        </div>
                        {prevExam && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Anterior: {prevExam.value ?? 'N/A'} {prevExam.unit || ''}</span>
                            <TrendingUp size={14} style={{ color: data.value > prevExam.value ? 'var(--danger-color)' : 'var(--success-color)', transform: data.value > prevExam.value ? 'none' : 'rotate(180deg)' }} />
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                      Nenhum exame selecionado.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                Nenhum exame registrado.
              </div>
            )}
          </div>
        )}

        {activeTab === 'estilo' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card glass-panel">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Apple className="text-primary" size={20} /> Análise Nutricional
              </h3>
              {currentPatient.nutrition ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{currentPatient.nutrition.dailyCalories}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kcal Consumidas</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{currentPatient.nutrition.qualityScore}/100</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Índice Qualidade</div>
                    </div>
                  </div>
                  
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Distribuição de Macronutrientes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <MacroBar label="Carboidratos" value={currentPatient.nutrition.macros.carbs.value} percent={currentPatient.nutrition.macros.carbs.percentage} color="#3b82f6" />
                    <MacroBar label="Proteínas" value={currentPatient.nutrition.macros.protein.value} percent={currentPatient.nutrition.macros.protein.percentage} color="#10b981" />
                    <MacroBar label="Gorduras" value={currentPatient.nutrition.macros.fat.value} percent={currentPatient.nutrition.macros.fat.percentage} color="#f59e0b" />
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
              {currentPatient.lifestyle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                      <Moon size={24} color="#8b5cf6" />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>Sono ({currentPatient.lifestyle.sleep.device})</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qualidade: {currentPatient.lifestyle.sleep.quality}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currentPatient.lifestyle.sleep.averageHours}h <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ noite</span></div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ec4899' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                      <Activity size={24} color="#ec4899" />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>Atividade ({currentPatient.lifestyle.activity.device})</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Média diária</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentPatient.lifestyle.activity.averageSteps}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Passos</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentPatient.lifestyle.activity.activeMinutes}</div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>

            {/* Header com botão */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} style={{ color: '#ef4444' }} /> Tratamento Médico
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Medicamentos contínuos e protocolo de suplementação.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => { setEditingMed(null); setIsTreatmentModalOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
              >
                <Pill size={16} /> Adicionar Tratamento
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {/* Medicamentos */}
              <div className="card glass-panel">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} style={{ color: '#ef4444' }} /> Medicamentos Contínuos
                </h3>
                {currentPatient.medications && currentPatient.medications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentPatient.medications.map((med, idx) => (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>{med.name}</div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Syringe size={13} />{med.dose}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} />{med.frequency}</span>
                          </div>
                          {med.notes && <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{med.notes}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.75rem' }}>
                          <button
                            onClick={() => { setEditingMed({ ...med, _idx: idx }); setIsTreatmentModalOpen(true); }}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          >Editar</button>
                          <button
                            onClick={async () => {
                              const updated = [...(currentPatient.medications || [])];
                              updated.splice(idx, 1);
                              const res = await fetch(`/api/patients/${currentPatient.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ medications: updated }),
                              });
                              if (res.ok) setCurrentPatient((p) => ({ ...p, medications: updated }));
                            }}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          >Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    Nenhum medicamento registrado.<br />
                    <span style={{ fontSize: '0.85rem' }}>Clique em "Adicionar Medicamento" para começar.</span>
                  </div>
                )}
              </div>

              {/* Suplementação */}
              <div className="card glass-panel">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Pill className="text-primary" size={20} /> Protocolo de Suplementação
                </h3>
                <div className="vitamin-list">
                  {currentPatient.vitamins && currentPatient.vitamins.length > 0 ? currentPatient.vitamins.map((vit, idx) => (
                    <div key={idx} className="vitamin-item">
                      <div className="vitamin-icon"><Pill size={20} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                          <h4 style={{ color: '#fff', margin: 0 }}>{vit.name}</h4>
                          <span className={`badge ${vit.priority === 'High' ? 'badge-danger' : vit.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                            {vit.priority === 'High' ? 'Alta' : vit.priority === 'Medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Dose: {vit.dose}</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{vit.reason}</p>
                      </div>
                    </div>
                  )) : (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Nenhuma vitamina prescrita.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Tratamento */}
        <TreatmentModal
          isOpen={isTreatmentModalOpen}
          onClose={() => { setIsTreatmentModalOpen(false); setEditingMed(null); }}
          editingMed={editingMed}
          onSave={async (form) => {
            const medications = [...(currentPatient.medications || [])];
            if (editingMed && typeof editingMed._idx === 'number') {
              medications[editingMed._idx] = { name: form.name, dose: form.dose, frequency: form.frequency, notes: form.notes };
            } else {
              medications.push({ name: form.name, dose: form.dose, frequency: form.frequency, notes: form.notes });
            }
            const res = await fetch(`/api/patients/${currentPatient.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ medications }),
            });
            if (!res.ok) throw new Error('Erro ao salvar');
            setCurrentPatient((p) => ({ ...p, medications }));
          }}
        />

        {activeTab === 'documentos' && (
          <div className="card glass-panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff' }}>Documentos do Paciente</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Envie PDFs para associar documentos diretamente a este paciente.</p>
              </div>
              <div>
                <button
                  onClick={handleDocumentButtonClick}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}
                >
                  <FileText size={18} /> Enviar PDF
                </button>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleDocumentChange}
                />
              </div>
            </div>

            {uploadMessage && (
              <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#a7f3d0' }}>
                {uploadMessage}
              </div>
            )}
            {uploadError && (
              <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.12)', color: '#fecaca' }}>
                {uploadError}
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
              {isUploadingDoc ? (
                <div style={{ color: 'var(--text-muted)' }}>Enviando documento...</div>
              ) : patientUploads.length > 0 ? (
                patientUploads.map((doc) => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{doc.filename}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(doc.created_at).toLocaleString('pt-BR')}</div>
                    </div>
                    <a href={`/api/uploads/${doc.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.9rem' }}>
                      Baixar
                    </a>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  Nenhum documento enviado para este paciente ainda.
                </div>
              )}
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={confirmOpen}
          title={confirmAction === 'delete' ? 'Confirmar exclusão' : confirmAction === 'add' ? 'Confirmar adição' : 'Confirmar alteração'}
          message={confirmAction === 'delete' ? 'Deseja realmente excluir este exame? A ação não pode ser desfeita.' : confirmAction === 'add' ? 'Confirmar adicionar este exame ao histórico do paciente?' : 'Confirmar salvar as alterações deste exame?'}
          onConfirm={performConfirmAction}
          onCancel={() => { setConfirmOpen(false); setConfirmAction(null); setExamToDelete(null); }}
        />

        {activeTab === 'conquistas' && (
          <div className="card glass-panel" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--primary-glow)', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}>
                <Trophy size={56} color="var(--primary-color)" />
              </div>
              <div>
                <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{currentPatient.rewards?.points || 0} Pontos</h2>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Nível Atual: <strong style={{ color: 'var(--accent-color)' }}>{currentPatient.rewards?.level || 'Iniciante'}</strong>
                </div>
              </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Badges Desbloqueadas</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {currentPatient.rewards?.badges ? currentPatient.rewards.badges.map((badge, idx) => (
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
                Atingindo 5000 pontos, você desbloqueia 1 retorno gratuito ou 15% de desconto na próxima suplementação. Faltam <strong style={{color: '#fff'}}>{5000 - (currentPatient.rewards?.points || 0)} pontos</strong>.
              </p>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', marginTop: '1.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${((currentPatient.rewards?.points || 0) / 5000) * 100}%`, background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', height: '100%', borderRadius: '6px' }}></div>
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
