import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function UploadSection({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [uploads, setUploads] = useState([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patient?.id) {
      setSelectedPatientId(patient.id);
    }
  }, [patient]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientUploads(selectedPatientId);
    } else {
      setUploads([]);
    }
  }, [selectedPatientId]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) return;
      const data = await response.json();
      setPatients(data);
      if (!selectedPatientId && data.length > 0 && !patient) {
        setSelectedPatientId(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  const fetchPatientUploads = async (patientId) => {
    setIsLoadingUploads(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/uploads`);
      if (!response.ok) {
        setUploads([]);
        return;
      }
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Erro ao buscar uploads do paciente:', error);
      setUploads([]);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setIsUploading(true);
    setSuccess(false);

    if (!selectedPatientId) {
      setErrorMessage('Selecione um paciente antes de enviar o arquivo.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', selectedPatientId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Falha ao enviar o arquivo.');
      }

      await response.json();
      setSuccess(true);
      fetchPatientUploads(selectedPatientId);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error('Erro de upload:', error);
      setErrorMessage(error.message || 'Falha no upload. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    await handleFile(file);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    await handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem', textAlign: 'center', display: 'block' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Importar Ficha do Paciente</h1>
        <p style={{ color: 'var(--text-muted)' }}>Envie os dados do Fitdays (CSV, PDF) e o Asclépio organizará tudo automaticamente.</p>
      </div>

      <div className="card glass-panel">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ color: '#fff', fontWeight: 600 }}>Paciente</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)', color: '#fff' }}
          >
            <option value="" disabled>{patients.length === 0 ? 'Carregando pacientes...' : 'Selecione um paciente'}</option>
            {patients.map((patientItem) => (
              <option key={patientItem.id} value={patientItem.id} style={{ background: '#111' }}>
                {patientItem.name} ({patientItem.age} anos)
              </option>
            ))}
          </select>
          {patients.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nenhum paciente disponível no momento. Crie um paciente na dashboard primeiro.
            </span>
          )}
        </div>

        {!isUploading && !success ? (
          <div
            className={`upload-area ${isDragging ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
            style={{ cursor: 'pointer' }}
          >
            <div className="upload-icon">
              <UploadCloud size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Clique ou arraste o arquivo aqui</h3>
            <p style={{ color: 'var(--text-muted)' }}>Suporta arquivos exportados do Fitdays (CSV) ou PDFs de bioimpedância.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <span className="badge badge-success"><FileText size={14} /> CSV</span>
              <span className="badge badge-warning"><FileText size={14} /> PDF</span>
            </div>
            {errorMessage && (
              <div className="upload-error" style={{ marginTop: '1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={16} /> {errorMessage}
              </div>
            )}
          </div>
        ) : isUploading ? (
          <div className="upload-area" style={{ borderStyle: 'solid', borderColor: 'var(--primary-color)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--primary-color)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Enviando o arquivo para o servidor...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Aguarde enquanto os dados são salvos no PostgreSQL.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="upload-area" style={{ borderStyle: 'solid', borderColor: 'var(--primary-color)', background: 'var(--primary-glow)' }}>
            <div className="upload-icon" style={{ background: 'var(--primary-color)', color: '#fff' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Upload realizado com sucesso!</h3>
            <p style={{ color: 'var(--text-muted)' }}>O arquivo foi enviado para o banco e pode ser usado para criar um novo paciente.</p>
          </div>
        )}
      </div>

      {selectedPatientId && (
        <div className="card glass-panel" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Documentos do paciente</h3>
          {isLoadingUploads ? (
            <p style={{ color: 'var(--text-muted)' }}>Carregando documentos...</p>
          ) : uploads.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {uploads.map((upload) => (
                <div key={upload.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{upload.filename}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(upload.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                  <a href={`/api/uploads/${upload.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Ver / Baixar
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum documento associado a este paciente ainda.</p>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
          <AlertCircle size={18} /> Como exportar do Fitdays?
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          1. Abra o aplicativo Fitdays no celular do paciente.<br/>
          2. Vá na aba "Histórico" ou "Gráficos".<br/>
          3. Sincronize com o Apple Health / Google Fit e exporte, ou use a função compartilhar para gerar o resumo em texto/imagem.<br/>
          4. Envie o arquivo para o computador da secretária e arraste nesta tela. O Asclépio fará o resto!
        </p>
      </div>
    </div>
  );
}
