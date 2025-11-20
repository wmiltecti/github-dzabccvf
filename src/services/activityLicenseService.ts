/**
 * Activity License Service
 * Serviço para gerenciar tipos de licença e documentos aplicáveis a atividades
 * Utiliza a API REST do backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================================================
// TYPES
// ============================================================================

export interface LicenseType {
  id: string;
  abbreviation: string;
  name: string;
  description?: string;
  validity_period?: number;
  time_unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyType {
  id: string;
  abbreviation: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollutionPotential {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLicenseType {
  id: string;
  activity_id: string;
  license_type_id: string;
  is_required: boolean;
  created_at: string;
  // Campos extras do join
  license_type_abbreviation?: string;
  license_type_name?: string;
  license_type_description?: string;
}

export interface ActivityDocument {
  id: string;
  activity_id: string;
  template_id: string;
  is_required: boolean;
  created_at: string;
  // Campos extras do join
  template_name?: string;
  template_category?: string;
}

export interface ActivityLicenseConfig {
  activity_id: string;
  activity_code: number;
  activity_name: string;
  license_types: ActivityLicenseType[];
  documents: ActivityDocument[];
}

export interface CreateLicenseTypeRequest {
  license_type_id: string;
  is_required: boolean;
}

export interface CreateDocumentRequest {
  template_id: string;
  is_required: boolean;
}

export interface UpdateRequiredRequest {
  is_required: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Busca token de autenticação do localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token') || localStorage.getItem('token');
}

/**
 * Cria headers padrão com autenticação
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Trata erros da API
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `Erro ${response.status}: ${response.statusText}`;
  
  try {
    const errorData = await response.json();
    if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
  } catch {
    // Ignora erro ao parsear JSON
  }

  throw new Error(errorMessage);
}

// ============================================================================
// DROPDOWN DATA (Carregar listas mestras)
// ============================================================================

/**
 * Carrega todos os tipos de licença disponíveis (para dropdown)
 * GET /api/v1/license-types
 */
export async function getLicenseTypes(): Promise<LicenseType[]> {
  const response = await fetch(`${API_BASE_URL}/license-types`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Carrega todos os templates de documentos disponíveis (para dropdown)
 * GET /api/v1/document-templates
 */
export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
  const response = await fetch(`${API_BASE_URL}/document-templates`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Carrega todos os tipos de estudo disponíveis (para dropdown)
 * GET /api/v1/study-types
 */
export async function getStudyTypes(): Promise<StudyType[]> {
  const response = await fetch(`${API_BASE_URL}/study-types`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Carrega todos os potenciais poluidores disponíveis (para dropdown)
 * GET /api/v1/referencias/pollution-potentials
 */
export async function getPollutionPotentials(): Promise<PollutionPotential[]> {
  const response = await fetch(`${API_BASE_URL}/referencias/pollution-potentials`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// ============================================================================
// ACTIVITY LICENSE CONFIG (Carregar configuração completa)
// ============================================================================

/**
 * Carrega TODA a configuração de licenças e documentos de uma atividade
 * ⭐ RECOMENDADO: Usar este endpoint ao invés de chamadas separadas
 * GET /api/v1/activities/{activity_id}/license-config
 */
export async function getActivityLicenseConfig(
  activityId: string
): Promise<ActivityLicenseConfig> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/license-config`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// ============================================================================
// LICENSE TYPES (Operações com tipos de licença)
// ============================================================================

/**
 * Carrega apenas os tipos de licença de uma atividade (alternativa)
 * GET /api/v1/activities/{activity_id}/license-types
 */
export async function getActivityLicenseTypes(
  activityId: string
): Promise<ActivityLicenseType[]> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/license-types`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Adiciona um tipo de licença a uma atividade
 * POST /api/v1/activities/{activity_id}/license-types
 * 
 * @returns Relacionamento criado com ID
 * @throws Error se tipo já vinculado (409 Conflict)
 */
export async function addLicenseType(
  activityId: string,
  data: CreateLicenseTypeRequest
): Promise<ActivityLicenseType> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/license-types`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Este tipo de licença já está vinculado a esta atividade');
    }
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Adiciona múltiplos tipos de licença de uma vez (bulk)
 * POST /api/v1/activities/{activity_id}/license-types/bulk
 */
export async function addLicenseTypesBulk(
  activityId: string,
  licenseTypes: CreateLicenseTypeRequest[]
): Promise<ActivityLicenseType[]> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/license-types/bulk`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ license_types: licenseTypes }),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Atualiza se um tipo de licença é obrigatório
 * PATCH /api/v1/activities/{activity_id}/license-types/{relation_id}
 * 
 * @param relationId ID do relacionamento (não do tipo de licença!)
 */
export async function updateLicenseTypeRequired(
  activityId: string,
  relationId: string,
  isRequired: boolean
): Promise<ActivityLicenseType> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/license-types/${relationId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_required: isRequired }),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Remove um tipo de licença de uma atividade
 * DELETE /api/v1/activities/{activity_id}/license-types/{relation_id}
 * 
 * @param relationId ID do relacionamento (não do tipo de licença!)
 */
export async function removeLicenseType(
  activityId: string,
  relationId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/license-types/${relationId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  // 204 No Content - sucesso sem retorno
}

// ============================================================================
// DOCUMENTS (Operações com documentos)
// ============================================================================

/**
 * Carrega apenas os documentos de uma atividade (alternativa)
 * GET /api/v1/activities/{activity_id}/documents
 */
export async function getActivityDocuments(
  activityId: string
): Promise<ActivityDocument[]> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/documents`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Adiciona um documento a uma atividade
 * POST /api/v1/activities/{activity_id}/documents
 * 
 * @returns Relacionamento criado com ID
 * @throws Error se documento já vinculado (409 Conflict)
 */
export async function addDocument(
  activityId: string,
  data: CreateDocumentRequest
): Promise<ActivityDocument> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/documents`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Este documento já está vinculado a esta atividade');
    }
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Adiciona múltiplos documentos de uma vez (bulk)
 * POST /api/v1/activities/{activity_id}/documents/bulk
 */
export async function addDocumentsBulk(
  activityId: string,
  documents: CreateDocumentRequest[]
): Promise<ActivityDocument[]> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/documents/bulk`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ documents }),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Atualiza se um documento é obrigatório
 * PATCH /api/v1/activities/{activity_id}/documents/{document_id}
 * 
 * @param documentId ID do relacionamento (não do template!)
 */
export async function updateDocumentRequired(
  activityId: string,
  documentId: string,
  isRequired: boolean
): Promise<ActivityDocument> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/documents/${documentId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_required: isRequired }),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Remove um documento de uma atividade
 * DELETE /api/v1/activities/{activity_id}/documents/{document_id}
 * 
 * @param documentId ID do relacionamento (não do template!)
 */
export async function removeDocument(
  activityId: string,
  documentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/activities/${activityId}/documents/${documentId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  // 204 No Content - sucesso sem retorno
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Carrega todos os dados necessários para o formulário em paralelo
 * Otimiza carregamento inicial fazendo 3 chamadas simultâneas
 */
export async function loadFormData(activityId?: string) {
  const promises: Promise<any>[] = [
    getLicenseTypes(),
    getDocumentTemplates(),
    getStudyTypes(),
  ];

  if (activityId) {
    promises.push(getActivityLicenseConfig(activityId));
  }

  const results = await Promise.all(promises);
  const [licenseTypes, documentTemplates, studyTypes] = results;
  const activityConfig = results[3] as ActivityLicenseConfig | undefined;

  return {
    licenseTypes: licenseTypes as LicenseType[],
    documentTemplates: documentTemplates as DocumentTemplate[],
    studyTypes: studyTypes as StudyType[],
    activityConfig,
  };
}
