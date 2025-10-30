import axios from "axios";

/**
 * Instância HTTP com baseURL do .env
 * Ex.: VITE_API_BASE_URL=http://localhost:8000/api/v1
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("userData") || localStorage.getItem("userdata");
    const directToken = localStorage.getItem("token");
    let token: string | undefined;

    if (raw) {
      try { token = JSON.parse(raw)?.token; } catch {}
    }
    if (!token && directToken) token = directToken;

    if (token) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
  } catch {}
  return config;
});

// helper para extrair o id de vários formatos de resposta
function extractId(data: any): string | undefined {
  const obj = Array.isArray(data) ? data[0] : data;
  if (!obj) return undefined;
  return (
    obj.id ??
    obj.processoId ??
    obj.uuid ??
    obj.key ??
    obj.processo_id ??
    obj.processoID
  );
}

/**
 * POST /processos/ → pode retornar {id: "..."} ou [{id: "..."}] (Supabase/PostgREST)
 */
export async function criarProcesso(userId: string): Promise<string> {
  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error("API não configurada (VITE_API_BASE_URL).");
  }

  const payload = { status: "draft", user_id: String(userId) };
  const res = await http.post("/processos/", payload);

  // log temporário para conferência
  console.log("↩︎ criarProcesso resposta:", res.status, res.data);

  const remoteId = extractId(res.data);
  if (!remoteId) {
    throw new Error("Resposta da API sem 'id' ou chave equivalente.");
  }
  return String(remoteId);
}

/**
 * PUT /processos/{id}/dados-gerais/
 * (note a barra final — muitos backends com FastAPI/Django/Supabase aceitam melhor)
 */
// ... (resto do arquivo igual)

export async function upsertDadosGerais(processoId: string, payload: any) {
  if (!processoId || processoId.startsWith("local-")) {
    throw new Error("Processo inválido: esperado ID remoto da API.");
  }

  // Garante processo_id no body, igual ao path:
  const body = { processo_id: processoId, ...payload };

  try {
    // Sem barra final para casar com seu curl
    const res = await http.put(`/processos/${processoId}/dados-gerais`, body);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error("❌ upsertDadosGerais error:", status, data);
    const msg = Array.isArray(data?.detail)
      ? data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(" | ")
      : (data?.detail || err.message || "Erro de validação.");
    throw new Error(msg);
  }
}

export async function getDadosGerais(processoId: string) {
  if (!processoId || processoId.startsWith("local-")) {
    throw new Error("Processo inválido: esperado ID remoto da API.");
  }

  try {
    // Usa o endpoint /processos/{id} em vez de /processos/{id}/dados-gerais
    const res = await http.get(`/processos/${processoId}`);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    // Se retornar 404 ou 405, retorna null (endpoint não existe ou não há dados ainda)
    if (status === 404 || status === 405) {
      console.log(`📡 getDadosGerais - Status ${status}, retornando null`);
      return null;
    }
    const data = err?.response?.data;
    console.error("❌ getDadosGerais error:", status, data);
    const msg = data?.detail || err.message || "Erro ao buscar dados gerais.";
    throw new Error(msg);
  }
}


// --- Tipos auxiliares (ajuste conforme seu backend) ---
export type WizardStatus = {
  processo_id?: string;
  v_dados_gerais?: boolean;       // dados gerais validados
  n_localizacoes?: number;         // número de localizações
  n_atividades?: number;           // número de atividades
  v_resp_tecnico?: boolean;        // responsável técnico validado
  current_step?: number;           // etapa atual (1..7)
  completed_steps?: number[];      // etapas concluídas
  is_complete?: boolean;           // se finalizou o wizard
  updated_at?: string;             // ISO string
};

/**
 * Recupera o status do wizard no backend.
 * Tenta primeiro /wizard-status; se não existir, tenta /status.
 * Ajuste o caminho caso seu backend use outro endpoint.
 */
export async function getWizardStatus(processoId: string): Promise<WizardStatus> {
  if (!processoId || processoId.startsWith("local-")) {
    throw new Error("Processo inválido para consultar status.");
  }

  try {
    // Ex.: GET /processos/{id}/wizard-status
    const res = await http.get(`/processos/${processoId}/wizard-status`);
    return res.data as WizardStatus;
  } catch (err: any) {
    // fallback: alguns backends expõem /status
    if (err?.response?.status === 404) {
      const res2 = await http.get(`/processos/${processoId}/status`);
      return res2.data as WizardStatus;
    }
    throw err;
  }
}

/**
 * Submete/finaliza o processo no backend.
 * Tenta primeiro: POST /processos/{id}/submit
 * Fallbacks comuns:
 *   - PUT  /processos/{id}/status   { status: "submitted" }
 *   - POST /processos/{id}/finalizar
 * Ajuste os caminhos conforme seu backend.
 */
export async function submitProcesso(processoId: string): Promise<any> {
  if (!processoId || processoId.startsWith("local-")) {
    throw new Error("Processo inválido para submissão.");
  }

  try {
    // caminho preferido
    const res = await http.post(`/processos/${processoId}/submit`);
    return res.data;
  } catch (err: any) {
    // fallback 1: atualizar status diretamente
    if (err?.response?.status === 404) {
      try {
        const res2 = await http.put(`/processos/${processoId}/status`, { status: "submitted" });
        return res2.data;
      } catch (err2: any) {
        // fallback 2: rota /finalizar
        if (err2?.response?.status === 404) {
          const res3 = await http.post(`/processos/${processoId}/finalizar`);
          return res3.data;
        }
        throw err2;
      }
    }
    throw err;
  }
}
