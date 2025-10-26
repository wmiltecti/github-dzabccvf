// src/lib/api/auth.ts
import http from './http';
import { PessoaTipo, LoginResponse } from '../../types/auth';
import { getByCpf } from './people';

type TipoDeIdentificacao = "CPF" | "CNPJ" | "PASSAPORTE" | "ID_ESTRANGEIRA";

interface LoginCredentials {
  tipoDeIdentificacao?: TipoDeIdentificacao;
  numeroIdentificacao: string;
  senha: string;
}

const normalizeId = (v: string) => (v ?? '').replace(/[^0-9A-Za-z]/g, '');
const mapTdi = (tdi?: TipoDeIdentificacao) =>
  tdi === 'ID_ESTRANGEIRA' ? 'ESTRANGEIRO' : tdi;

const isCPF = (v: string) => {
  const digits = v.replace(/\D/g, '');
  return digits.length === 11;
};

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
    const { data } = await http.post<LoginResponse>("/auth/login", body);

    if (data?.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data));

      if (pessoaTipo === 'PF' && isCPF(credenciais.numeroIdentificacao)) {
        try {
          const { data: personData, error } = await getByCpf(credenciais.numeroIdentificacao);

          if (!error && personData) {
            localStorage.setItem("auth_person", JSON.stringify(personData));
            console.log('Dados da pessoa carregados:', personData);
          } else if (error) {
            console.warn('Não foi possível carregar dados da pessoa:', error.message);
          }
        } catch (err) {
          console.warn('Erro ao buscar dados da pessoa:', err);
        }
      }
    }

    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.detail?.message ||
      err?.message ||
      "Erro ao fazer login";
    throw new Error(msg);
  }
}
