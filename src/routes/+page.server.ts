import { supabase } from "$lib/supabaseClient";
import { nodesStore } from '../stores';


export async function load() {

  const { data, error } = await supabase
    .from('nodes')
    .select();
  
  
    nodesStore.set(data ?? []);
  
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

