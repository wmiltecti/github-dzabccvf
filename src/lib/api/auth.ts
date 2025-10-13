import http from './http';
import { PessoaTipo, LoginResponse } from '../../types/auth';

interface LoginCredentials {
  tipoDeIdentificacao?: "CPF" | "CNPJ" | "PASSAPORTE" | "ID_ESTRANGEIRA";
  numeroIdentificacao: string;
  senha: string;
}

export async function login(
  pessoaTipo: PessoaTipo,
  credenciais: LoginCredentials
): Promise<LoginResponse> {
  let payload: any;

  if (pessoaTipo === "ESTRANGEIRO") {
    if (!credenciais.tipoDeIdentificacao) {
      throw new Error("tipoDeIdentificacao é obrigatório para ESTRANGEIRO");
    }
    payload = {
      tipoDeIdentificacao: credenciais.tipoDeIdentificacao,
      login: credenciais.numeroIdentificacao,
      senha: credenciais.senha,
    };
  } else {
    payload = {
      login: credenciais.numeroIdentificacao,
      senha: credenciais.senha,
    };
  }

  const response = await http.post<LoginResponse>("/usuarios/login", payload);
  const data = response.data;

  if (data.token) {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data));
  }

  return data;
}
