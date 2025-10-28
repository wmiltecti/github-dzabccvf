import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import InscricaoLayout from './components/InscricaoLayout';
import ParticipantesPage from './pages/inscricao/ParticipantesPage';
import ImovelPage from './pages/inscricao/ImovelPage';
import EmpreendimentoPage from './pages/inscricao/EmpreendimentoPage';
import RevisaoPage from './pages/inscricao/RevisaoPage';

function App() {
  return (
    <AuthProvider>
      <Router>
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
          
          {/* ROTAS DE INSCRIÇÃO - ADICIONAR AQUI */}
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
            <Route path="revisao" element={<RevisaoPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
