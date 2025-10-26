export type PessoaTipo = "PF" | "PJ" | "PASSAPORTE" | "ESTRANGEIRO";

export interface LoginPF_PJ_Passaporte {
  tipoDeIdentificacao: "CPF" | "CNPJ" | "PASSAPORTE";
  numeroIdentificacao: string;
  senha: string;
}

export interface LoginEstrangeiro {
  tipoDeIdentificacao: "ID_ESTRANGEIRA";
  numeroIdentificacao: string;
  senha: string;
}

export type LoginRequest = LoginPF_PJ_Passaporte | LoginEstrangeiro;

export interface LoginResponse {
  token: string;
  userId: string;
  nome: string;
}
