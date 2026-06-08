import React, { useState } from 'react';
import './index.css';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import UploadSection from './components/UploadSection';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, profile, upload
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentView('profile');
  };

  const handleBackToDashboard = () => {
    setSelectedPatient(null);
    setCurrentView('dashboard');
  };

  const handleUploadComplete = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard onSelectPatient={handleSelectPatient} />
        )}
        
        {currentView === 'profile' && selectedPatient && (
          <PatientProfile patient={selectedPatient} onBack={handleBackToDashboard} />
        )}
        
        {currentView === 'upload' && (
          <UploadSection onUploadComplete={handleUploadComplete} />
        )}
      </main>
    </div>
  );
}

export default App;
