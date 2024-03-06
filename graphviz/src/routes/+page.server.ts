import { supabase } from "$lib/supabaseClient";



export async function load() {

  const { data, error } = await supabase
    .from('nodes')
    .select();
  
  
  return {
    nodes: data ?? [],

  };
  
}





// Override the type for a specific column in a view:

