// src/lib/api/auth.ts
import http from './http';
import { PessoaTipo, LoginResponse } from '../../types/auth';

type TipoDeIdentificacao = "CPF" | "CNPJ" | "PASSAPORTE" | "ID_ESTRANGEIRA";

interface LoginCredentials {
  tipoDeIdentificacao?: TipoDeIdentificacao;
  numeroIdentificacao: string;
  senha: string;
}

const normalizeId = (v: string) => (v ?? '').replace(/[^0-9A-Za-z]/g, '');
const mapTdi = (tdi?: TipoDeIdentificacao) =>
  tdi === 'ID_ESTRANGEIRA' ? 'ESTRANGEIRO' : tdi; // FastAPI espera 'ESTRANGEIRO'

export async function login(
  pessoaTipo: PessoaTipo,
  credenciais: LoginCredentials
): Promise<LoginResponse> {
  const body: Record<string, any> = {
    login: normalizeId(credenciais.numeroIdentificacao),
    senha: credenciais.senha,
  };

  if (pessoaTipo === "ESTRANGEIRO") {
    const mapped = mapTdi(credenciais.tipoDeIdentificacao);
    if (!mapped) throw new Error("tipoDeIdentificacao é obrigatório para ESTRANGEIRO");
    body.tipoDeIdentificacao = mapped;
  }

  try {
    // 🔁 rota do FastAPI
    const { data } = await http.post<LoginResponse>("/auth/login", body);

    if (data?.token) {
      // mantém as chaves que você já usa no front
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data));
    }

    return data;
  } catch (err: any) {
    // extrai mensagem do FastAPI (message | detail.message) ou do Axios
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.detail?.message ||
      err?.message ||
      "Erro ao fazer login";
    throw new Error(msg);
  }
}
