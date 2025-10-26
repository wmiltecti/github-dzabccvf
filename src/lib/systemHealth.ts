import { supabase, isSupabaseConfigured } from './supabase';
import { testBackendConnection } from './api/http';

export interface SystemHealth {
  supabase: {
    configured: boolean;
    connected: boolean;
  };
  backend: {
    configured: boolean;
    connected: boolean;
  };
  overall: 'healthy' | 'degraded' | 'offline';
}

export async function checkSystemHealth(): Promise<SystemHealth> {
  const supabaseConfigured = isSupabaseConfigured();
  let supabaseConnected = false;

  if (supabaseConfigured) {
    try {
      const { error } = await supabase.auth.getSession();
      supabaseConnected = !error;
    } catch {
      supabaseConnected = false;
    }
  }

  const backendConfigured = !!import.meta.env.VITE_API_BASE_URL;
  const backendConnected = backendConfigured ? await testBackendConnection() : false;

  let overall: 'healthy' | 'degraded' | 'offline' = 'offline';

  if (supabaseConnected) {
    overall = 'healthy';
  } else if (backendConnected) {
    overall = 'degraded';
  }

  return {
    supabase: {
      configured: supabaseConfigured,
      connected: supabaseConnected,
    },
    backend: {
      configured: backendConfigured,
      connected: backendConnected,
    },
    overall,
  };
}

export function getHealthStatusMessage(health: SystemHealth): string {
  if (health.overall === 'healthy') {
    return 'Sistema operacional';
  } else if (health.overall === 'degraded') {
    return 'Sistema com funcionalidade limitada';
  } else {
    return 'Sistema indisponível. Verifique sua conexão ou tente mais tarde.';
  }
}
