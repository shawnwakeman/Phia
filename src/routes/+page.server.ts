import { supabase, loadNodeData } from "$lib/supabaseClient";
import { nodesStore } from '../stores';

import { get } from 'svelte/store';




export async function load() {

  loadNodeData() // does not go on every load 
  
  return {
    nodes: get(nodesStore) ?? [],

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

