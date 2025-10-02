import { supabase } from '../supabaseClient';
import { friendlyError, err } from './errors';
import { ID, ParticipantRole } from './types';

async function requireProfileId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw err('Usuário não autenticado', 'AUTH');
  return user.id;
}

export async function createRascunho() {
  const created_by = await requireProfileId();
  const { data, error } = await supabase.from('processes')
    .insert({ status: 'RAScunho', created_by })
    .select()
    .single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function linkProperty(processId: ID, propertyId: ID) {
  const { data, error } = await supabase
    .from('processes')
    .update({ property_id: propertyId })
    .eq('id', processId)
    .select()
    .single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

type UpsertParticipantInput = {
  personId: ID;
  role: ParticipantRole;
  procuracao_file_id?: string | null;
};

export async function upsertParticipant(processId: ID, input: UpsertParticipantInput) {
  // regra extra no app para mensagens mais claras
  if (input.role === 'PROCURADOR' && !input.procuracao_file_id) {
    return { data: null, error: err('Procurador exige upload da procuração.') };
  }

  const payload: any = {
    process_id: processId,
    person_id: input.personId,
    role: input.role,
    procuracao_file_id: input.procuracao_file_id ?? null,
  };

  // Tentar inserir; se já houver (UNIQUE), atualizar
  const ins = await supabase.from('process_participants').insert(payload).select().maybeSingle();

  if (ins.error) {
    const msg = String(ins.error.message || '');
    // Se violou UNIQUE (ex: já existe REQUERENTE), retorna erro amigável
    if (ins.error.code === '23505' || /unique/i.test(msg)) {
      if (input.role === 'REQUERENTE') {
        return { data: null, error: err('Somente um requerente pode ser vinculado por processo.', 'UNIQUE') };
      }
      // Tentativa de duplicar mesmo par process/person/role → atualiza
      const upd = await supabase.from('process_participants')
        .update(payload)
        .match({ process_id: processId, person_id: input.personId, role: input.role })
        .select()
        .single();
      if (upd.error) return { data: null, error: friendlyError(upd.error) };
      return { data: upd.data, error: null };
    }
    return { data: null, error: friendlyError(ins.error) };
  }

  return { data: ins.data, error: null };
}

export async function getParticipants(processId: ID) {
  const { data, error } = await supabase
    .from('process_participants')
    .select('*, people(*)')
    .eq('process_id', processId);

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function removeParticipant(processId: ID, personId: ID, role: ParticipantRole) {
  const { data, error } = await supabase
    .from('process_participants')
    .delete()
    .match({ process_id: processId, person_id: personId, role });

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}


export async function getFull(processId: ID) {
  // pega processo
  const p = await supabase.from('processes')
    .select('*, properties:property_id (*), participants:process_participants (*), titles:properties!inner(property_titles(*))')
    .eq('id', processId)
    .maybeSingle();

  if (p.error) return { data: null, error: friendlyError(p.error) };

  // participantes e títulos separados se preferir
  const [participants, titles] = await Promise.all([
    supabase.from('process_participants').select('*, people(*)').eq('process_id', processId),
    p.data?.property_id
      ? supabase.from('property_titles').select('*').eq('property_id', p.data.property_id)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (participants.error) return { data: null, error: friendlyError(participants.error) };
  if (titles.error) return { data: null, error: friendlyError(titles.error) };

  return {
    data: {
      process: p.data,
      participants: participants.data,
      titles: titles.data,
    },
    error: null,
  };
}


