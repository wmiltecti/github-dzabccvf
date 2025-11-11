/**
 * enterpriseValidators.ts
 * Validadores para regras de negócio de empreendimento
 */

import { Enterprise } from '../services/enterpriseService';

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Valida se a pesquisa de empreendimento foi realizada quando obrigatório
 * @param searchPerformed - Se a pesquisa foi realizada
 * @param isSearchRequired - Se a pesquisa é obrigatória pelas configs
 * @returns Resultado da validação
 */
export function validateEnterpriseSearch(
  searchPerformed: boolean,
  isSearchRequired: boolean
): ValidationResult {
  if (isSearchRequired && !searchPerformed) {
    return {
      isValid: false,
      message: 'Pesquise o empreendimento antes de continuar'
    };
  }

  return { isValid: true };
}

/**
 * Valida se há empreendimento selecionado ou cadastro novo quando necessário
 * @param selectedEnterprise - Empreendimento selecionado (se houver)
 * @param isNewEnterprise - Se está em modo de novo cadastro
 * @param searchPerformed - Se a pesquisa foi realizada
 * @param allowNewRegister - Se permite novo cadastro pelas configs
 * @returns Resultado da validação
 */
export function validateEnterpriseSelection(
  selectedEnterprise: Enterprise | null,
  isNewEnterprise: boolean,
  searchPerformed: boolean,
  allowNewRegister: boolean
): ValidationResult {
  // Se não fez pesquisa, não valida ainda
  if (!searchPerformed) {
    return { isValid: true };
  }

  // Se selecionou ou está em modo novo, está OK
  if (selectedEnterprise || isNewEnterprise) {
    return { isValid: true };
  }

  // Se não permite novo cadastro e não selecionou nada
  if (!allowNewRegister) {
    return {
      isValid: false,
      message: 'Cadastro de novo empreendimento não permitido. Selecione um empreendimento existente'
    };
  }

  return { isValid: true };
}

/**
 * Valida se os dados do empreendimento estão completos antes de submeter
 * @param formData - Dados do formulário de empreendimento
 * @returns Resultado da validação
 */
export function validateEnterpriseData(formData: {
  tipo_empreendimento?: string;
  tipo_licenca?: string;
  situacao?: string;
}): ValidationResult {
  if (!formData.tipo_empreendimento || formData.tipo_empreendimento === 'Selecione') {
    return {
      isValid: false,
      message: 'Selecione o tipo de empreendimento'
    };
  }

  if (!formData.tipo_licenca || formData.tipo_licenca === 'Selecione') {
    return {
      isValid: false,
      message: 'Selecione o tipo de licença'
    };
  }

  if (!formData.situacao || formData.situacao === 'Selecione') {
    return {
      isValid: false,
      message: 'Selecione a situação do empreendimento'
    };
  }

  return { isValid: true };
}

/**
 * Validação completa do processo de empreendimento
 * Combina todas as validações em uma única função
 */
export function validateEnterpriseProcess(params: {
  searchPerformed: boolean;
  selectedEnterprise: Enterprise | null;
  isNewEnterprise: boolean;
  isSearchRequired: boolean;
  allowNewRegister: boolean;
  formData: {
    tipo_empreendimento?: string;
    tipo_licenca?: string;
    situacao?: string;
  };
}): ValidationResult {
  const {
    searchPerformed,
    selectedEnterprise,
    isNewEnterprise,
    isSearchRequired,
    allowNewRegister,
    formData
  } = params;

  // 1. Valida se pesquisa foi feita (quando obrigatória)
  const searchValidation = validateEnterpriseSearch(searchPerformed, isSearchRequired);
  if (!searchValidation.isValid) {
    return searchValidation;
  }

  // 2. Valida se selecionou ou está cadastrando novo
  const selectionValidation = validateEnterpriseSelection(
    selectedEnterprise,
    isNewEnterprise,
    searchPerformed,
    allowNewRegister
  );
  if (!selectionValidation.isValid) {
    return selectionValidation;
  }

  // 3. Valida se os dados do formulário estão completos
  const dataValidation = validateEnterpriseData(formData);
  if (!dataValidation.isValid) {
    return dataValidation;
  }

  return { isValid: true };
}

/**
 * Valida se pode prosseguir para próxima etapa do wizard
 */
export function canProceedToNextStep(params: {
  searchPerformed: boolean;
  selectedEnterprise: Enterprise | null;
  isNewEnterprise: boolean;
  isSearchRequired: boolean;
  allowNewRegister: boolean;
}): ValidationResult {
  const {
    searchPerformed,
    selectedEnterprise,
    isNewEnterprise,
    isSearchRequired,
    allowNewRegister
  } = params;

  // 1. Valida pesquisa
  const searchValidation = validateEnterpriseSearch(searchPerformed, isSearchRequired);
  if (!searchValidation.isValid) {
    return searchValidation;
  }

  // 2. Valida seleção
  const selectionValidation = validateEnterpriseSelection(
    selectedEnterprise,
    isNewEnterprise,
    searchPerformed,
    allowNewRegister
  );
  if (!selectionValidation.isValid) {
    return selectionValidation;
  }

  // 3. Verifica se tem algo selecionado OU está em modo novo
  if (!selectedEnterprise && !isNewEnterprise) {
    return {
      isValid: false,
      message: 'Selecione um empreendimento ou inicie um novo cadastro'
    };
  }

  return { isValid: true };
}

export default {
  validateEnterpriseSearch,
  validateEnterpriseSelection,
  validateEnterpriseData,
  validateEnterpriseProcess,
  canProceedToNextStep
};
