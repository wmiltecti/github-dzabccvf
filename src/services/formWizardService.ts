import { supabase } from '../lib/supabase';

export interface FormStepData {
  step: number;
  data: any;
  processId?: string;
}

export const saveStep = async (step: number, data: any, processId?: string) => {
  try {
    console.log(`💾 Salvando etapa ${step} na API...`, { step, data, processId });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    const user = session.user;

    const payload = {
      user_id: user.id,
      step_number: step,
      step_data: data,
      process_id: processId,
      updated_at: new Date().toISOString()
    };

    const { data: savedData, error } = await supabase
      .from('form_wizard_steps')
      .upsert(payload, {
        onConflict: 'user_id,step_number,process_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar etapa:', error);
      throw error;
    }

    console.log('✅ Etapa salva com sucesso:', savedData);
    return { data: savedData, error: null };

  } catch (error) {
    console.error('❌ Erro ao salvar etapa:', error);
    return { data: null, error };
  }
};

export const loadStepData = async (step: number, processId?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    const user = session.user;

    let query = supabase
      .from('form_wizard_steps')
      .select('*')
      .eq('user_id', user.id)
      .eq('step_number', step);

    if (processId) {
      query = query.eq('process_id', processId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Erro ao carregar etapa:', error);
      throw error;
    }

    return { data: data?.step_data || null, error: null };

  } catch (error) {
    console.error('Erro ao carregar etapa:', error);
    return { data: null, error };
  }
};

export const loadAllSteps = async (processId?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    const user = session.user;

    let query = supabase
      .from('form_wizard_steps')
      .select('*')
      .eq('user_id', user.id)
      .order('step_number', { ascending: true });

    if (processId) {
      query = query.eq('process_id', processId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao carregar todas as etapas:', error);
      throw error;
    }

    const formData: any = {};
    data?.forEach(item => {
      formData[`step${item.step_number}`] = item.step_data;
    });

    return { data: formData, error: null };

  } catch (error) {
    console.error('Erro ao carregar todas as etapas:', error);
    return { data: null, error };
  }
};

export const saveDraft = async (currentStep: number, allData: any, processId?: string) => {
  try {
    console.log('💾 Salvando rascunho completo...');

    const savePromises = Object.keys(allData).map(key => {
      const stepNumber = parseInt(key.replace('step', ''));
      return saveStep(stepNumber, allData[key], processId);
    });

    await Promise.all(savePromises);

    await saveStep(currentStep, { lastSavedStep: currentStep }, processId);

    console.log('✅ Rascunho salvo com sucesso!');
    return { success: true, error: null };

  } catch (error) {
    console.error('❌ Erro ao salvar rascunho:', error);
    return { success: false, error };
  }
};
