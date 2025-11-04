export interface Participant {
  id?: string;
  type: 'PF' | 'PJ';
  role: 'REQUERENTE' | 'PROCURADOR' | 'RESP_TECNICO';
  
  // PF fields
  cpf?: string;
  nome?: string;
  sexo?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
  
  // PJ fields
  cnpj?: string;
  razao_social?: string;
  inscricao_estadual?: string;
  
  // Common fields
  celular?: string;
  email?: string;
  
  // Procuração
  procuracao_file_id?: string;
}

export interface Address {
  id?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  ponto_referencia?: string;
  uf?: string;
  municipio?: string;
}

export interface PropertyTitle {
  id?: number;
  tipo_cartorio?: string;
  nome_cartorio?: string;
  comarca?: string;
  uf?: string;
  matricula?: string;
  livro?: string;
  folha?: string;
  area_total_ha?: number;
}

export interface Property {
  id?: number;
  kind: 'URBANO' | 'RURAL' | 'LINEAR';
  nome?: string;
  areatotal?: number;
  municipio_sede?: string;
  roteiro_acesso?: string;
  utm_lat?: string;
  utm_long?: string;
  utm_zona?: string;
  dms_lat?: string;
  dms_long?: string;
  car_codigo?: string;
  address?: Address;
}

export interface InscricaoState {
  processId: number | null;
  propertyId: number | null;
  participants: Participant[];
  property: Property | null;
  titles: PropertyTitle[];
  atividadeId: number | null;
  currentStep: number;
}