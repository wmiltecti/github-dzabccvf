// Exemplo de integração do sistema de notificações no App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotificationBell from './components/notifications/NotificationBell';
import NotificationCenter from './components/notifications/NotificationCenter';

// Exemplo 1: Adicionar NotificationBell no Header/Navbar
function Header() {
  // Assumindo que você tem um contexto/hook de autenticação
  const user = { id: 'user-uuid-123' }; // Substitua pelo seu hook real
  
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Minha Aplicação</h1>
          </div>
          
          {/* Menu */}
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/processos" className="text-gray-700 hover:text-gray-900">
              Processos
            </a>
            
            {/* Notification Bell */}
            <NotificationBell userId={user.id} />
            
            {/* User menu */}
            <div className="ml-3">
              <button className="flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  Usuário
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

// Exemplo 2: Configurar rotas no App
function App() {
  const user = { id: 'user-uuid-123' }; // Seu hook de autenticação
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main>
          <Routes>
            {/* Rota para Central de Notificações */}
            <Route 
              path="/notificacoes" 
              element={<NotificationCenter userId={user.id} />} 
            />
            
            {/* Outras rotas */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/processos" element={<ProcessList />} />
            {/* ... */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Exemplo 3: Usar hook diretamente em um componente
import { useEffect } from 'react';
import { useNotifications } from './hooks/useNotifications';

function CustomNotificationComponent() {
  const userId = 'user-uuid-123';
  
  const {
    stats,
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    startPolling,
    stopPolling,
  } = useNotifications(userId);
  
  // Carregar notificações e iniciar polling
  useEffect(() => {
    fetchNotifications();
    startPolling(30000); // 30 segundos
    
    return () => {
      stopPolling();
    };
  }, [fetchNotifications, startPolling, stopPolling]);
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Minhas Notificações ({stats.unread_count} não lidas)
      </h2>
      
      <div className="space-y-2">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={`p-3 rounded border ${
              notif.is_read ? 'bg-gray-50' : 'bg-white font-semibold'
            }`}
            onClick={() => markAsRead(notif.id)}
          >
            <h3>{notif.title}</h3>
            <p className="text-sm text-gray-600">{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Exemplo 4: Integração com Context API
import { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from './hooks/useNotifications';

interface NotificationContextType {
  stats: { unread_count: number; total_count: number };
  fetchStats: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ 
  userId, 
  children 
}: { 
  userId: string; 
  children: ReactNode;
}) {
  const { stats, fetchStats, startPolling, stopPolling } = useNotifications(userId);
  
  useEffect(() => {
    startPolling(30000);
    return () => stopPolling();
  }, [startPolling, stopPolling]);
  
  return (
    <NotificationContext.Provider value={{ stats, fetchStats }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

// Uso do Context:
function AppWithProvider() {
  const user = { id: 'user-uuid-123' };
  
  return (
    <NotificationProvider userId={user.id}>
      <App />
    </NotificationProvider>
  );
}

// E em qualquer componente filho:
function AnyComponent() {
  const { stats } = useNotificationContext();
  
  return <div>Notificações não lidas: {stats.unread_count}</div>;
}

export default App;
