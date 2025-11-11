import { useState } from 'react';
import { User, LogOut, Mail, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../ConfirmDialog';

export default function UserPanel() {
  const { user, userMetadata, signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    if (isLoggingOut) return;
    setConfirmLogoutOpen(true);
  };

  const confirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    const name = userMetadata?.name || user.email;
    if (!name) return 'U';

    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    return userMetadata?.name || user.email?.split('@')[0] || 'Usuário';
  };

  const getUserRole = () => {
    const role = userMetadata?.role || 'user';
    const roleNames: Record<string, string> = {
      admin: 'Administrador',
      analyst: 'Analista',
      user: 'Usuário',
      viewer: 'Visualizador'
    };
    return roleNames[role] || 'Usuário';
  };

  return (
    <div className="fixed bottom-6 left-6 z-[1000]">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Collapsed View */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
            {getUserInitials()}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-500">{getUserRole()}</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Expanded View */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-3 space-y-2">
              {/* Email */}
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate max-w-[180px]">{user.email}</span>
              </div>

              {/* Role Badge */}
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span>{getUserRole()}</span>
              </div>

              {/* User ID (for debugging) */}
              {userMetadata?.role === 'admin' && (
                <div className="text-xs text-gray-400 font-mono truncate">
                  ID: {user.id.substring(0, 8)}...
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full p-3 flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-t border-red-100"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Saindo...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sair</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={confirmSignOut}
        title="Sair do Sistema"
        message="Deseja realmente sair?"
        confirmText="Sim, Sair"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
