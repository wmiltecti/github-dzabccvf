export type UUID = string;
export type ID = number;

export type PersonType = 'PF' | 'PJ';
export type ParticipantRole = 'REQUERENTE' | 'PROCURADOR' | 'RESP_TECNICO';
export type PropertyKind = 'URBANO' | 'RURAL' | 'LINEAR';

export interface Profile {
  id: UUID;
  email?: string;
  nome?: string;
  setor?: string;
}

export interface PersonPF {
  type: 'PF';
  cpf: string;
  nome: string;
  sexo?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
  celular?: string;
  email?: string;
}

export interface PersonPJ {
  type: 'PJ';
  cnpj: string;
  razao_social: string;
  inscricao_estadual?: string;
  celular?: string;
  email?: string;
}

export interface Address {
  id?: ID;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  ponto_referencia?: string;
  uf?: string;    // 2 letras
  municipio?: string;
}

export interface PropertyPayload {
  kind: PropertyKind;
  municipio_sede?: string;
  roteiro_acesso?: string;
  utm_lat?: string;
  utm_long?: string;
  utm_zona?: string;
  dms_lat?: string;
  dms_long?: string;
  car_codigo?: string | null;
  address?: Address | ID | null; // objeto novo OU id existente
  
  // LINEAR específico
  municipio_inicio?: string;
  uf_inicio?: string;
  municipio_final?: string;
  uf_final?: string;
  sistema_referencia?: string;
  
  // URBANO específico
  uf?: string;
  municipio?: string;
  roteiro_acesso_detalhado?: string;
  // Demais campos já existentes: utm_*, dms_*, address, sistema_referencia
}

export interface PropertyTitlePayload {
  tipo_cartorio?: string;
  nome_cartorio?: string;
  comarca?: string;
  uf?: string; // 2 letras
  matricula?: string;
  livro?: string;
  folha?: string;
  area_total_ha?: number | null;
}
