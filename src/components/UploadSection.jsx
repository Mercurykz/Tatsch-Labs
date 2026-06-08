import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadSection({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onUploadComplete) onUploadComplete();
      }, 2000);
    }, 1500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    simulateUpload();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem', textAlign: 'center', display: 'block' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Importar Ficha do Paciente</h1>
        <p style={{ color: 'var(--text-muted)' }}>Envie os dados do Fitdays (CSV, PDF) e o Asclépio organizará tudo automaticamente.</p>
      </div>

      <div className="card glass-panel">
        {!isUploading && !success ? (
          <div 
            className={`upload-area ${isDragging ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={simulateUpload}
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
          </div>
        ) : isUploading ? (
          <div className="upload-area" style={{ borderStyle: 'solid', borderColor: 'var(--primary-color)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--primary-color)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Processando e analisando dados com IA...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Extraindo métricas, calculando evoluções e definindo protocolo de vitaminas.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="upload-area" style={{ borderStyle: 'solid', borderColor: 'var(--primary-color)', background: 'var(--primary-glow)' }}>
            <div className="upload-icon" style={{ background: 'var(--primary-color)', color: '#fff' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Dados Processados com Sucesso!</h3>
            <p style={{ color: 'var(--text-muted)' }}>O perfil do paciente foi atualizado e a prescrição de vitaminas foi gerada.</p>
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
