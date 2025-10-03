import { supabase } from '../supabase';
import { friendlyError, err } from './errors';
import { ID } from './types';

function buildPath(processId: ID, filename: string) {
  const safe = filename.replace(/\s+/g, '_');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${processId}/${stamp}-${safe}`;
}

/**
 * Sobe um PDF de procuração para o bucket 'docs' no caminho `${processId}/<data>-<arquivo>.pdf`.
 * Retorna o storage path para ser salvo em process_participants.procuracao_file_id.
 */
export async function uploadProcuracao(processId: ID, file: File) {
  if (!file) return { data: null, error: err('Arquivo não selecionado.') };
  if (!/pdf$/i.test(file.name)) return { data: null, error: err('A procuração deve ser um arquivo PDF.') };

  const path = buildPath(processId, file.name);

  const { data, error } = await supabase.storage.from('docs').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'application/pdf',
  });

  if (error) return { data: null, error: friendlyError(error) };
  return { data: { path: data.path }, error: null };
}

/** Gera URL temporária de download (bucket privado) */
export async function getSignedUrl(path: string, expiresInSeconds = 60 * 10) {
  const { data, error } = await supabase.storage.from('docs').createSignedUrl(path, expiresInSeconds);
  if (error) return { data: null, error: friendlyError(error) };
  return { data: data.signedUrl, error: null };
}
