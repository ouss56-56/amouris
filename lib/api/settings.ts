import { createClient } from '@/lib/supabase/client';


export const fetchSettings = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
  if (error) throw error;
  return data;
};

export const updateSettings = async (settings: any) => {
  const supabase = createClient();
  
  // Since we use a single row, we can just upsert with the ID if we have it,
  // or fetch the ID first. For simplicity, since the ID is UUID, we can usemaybeSingle.
  const { data: current } = await supabase.from('settings').select('id').limit(1).maybeSingle();
  
  const payload = {
    ...settings,
    id: current?.id, // Keep existing ID if present
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('settings').upsert(payload);
  if (error) throw error;
  
  return true;
};
