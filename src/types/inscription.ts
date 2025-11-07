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
  arquivogeorreferenciamento?: string;
  address?: Address;
  
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
  // Coordenadas UTM já existem: utm_lat, utm_long, utm_zona
  // Coordenadas DMS já existem: dms_lat, dms_long
  // Endereço já existe via address (cep, logradouro, numero, bairro, complemento, uf, municipio)
  // Sistema de referência compartilha com LINEAR
  // Dados cartoriais (via PropertyTitle): tipo_cartorio, nome_cartorio, comarca, uf, matricula, livro, folha, area_total_ha
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