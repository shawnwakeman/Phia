import { supabase } from "$lib/supabaseClient";



export async function load() {

  const { data, error } = await supabase
    .from('nodes')
    .select();
  
  
  return {
    nodes: data ?? [],

  };
  
}





const channels = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'nodes' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()



// Override the type for a specific column in a view:

