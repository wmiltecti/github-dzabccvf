import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAutoLogin } from './hooks/useAutoLogin';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import InscricaoLayout from './components/InscricaoLayout';
import ParticipantesPage from './pages/inscricao/ParticipantesPage';
import ImovelPage from './pages/inscricao/ImovelPage';
import EmpreendimentoPage from './pages/inscricao/EmpreendimentoPage';
import DocumentacaoPage from './pages/inscricao/DocumentacaoPage';
import RevisaoPage from './pages/inscricao/RevisaoPage';

// Componente interno que usa o hook
function AppRoutes() {
  // Processa auto-login via URL
  useAutoLogin();
  
  // Verifica se está em processo de auto-login
  const urlParams = new URLSearchParams(window.location.search);
  const isAutoLoginInProgress = urlParams.has('token') && urlParams.has('userId');
  
  // Durante auto-login, mostra loading ao invés de redirecionar
  if (isAutoLoginInProgress) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Processando login...</span>
        </div>
        <p>Processando autenticação automática...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/inscricao/*"
        element={
          <ProtectedRoute>
            <InscricaoLayout />
          </ProtectedRoute>
        }
      >
        <Route path="participantes" element={<ParticipantesPage />} />
        <Route path="imovel" element={<ImovelPage />} />
        <Route path="empreendimento" element={<EmpreendimentoPage />} />
        <Route path="documentacao" element={<DocumentacaoPage />} />
        <Route path="revisao" element={<RevisaoPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;