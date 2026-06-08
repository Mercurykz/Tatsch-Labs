import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function UploadSection({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setIsUploading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

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
