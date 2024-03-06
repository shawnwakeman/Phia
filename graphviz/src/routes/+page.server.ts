import { supabase } from "$lib/supabaseClient";


let sa = 1000;
export async function load() {

  
  const { data } = await supabase.from("nodes").select();
  return {
    nodes: data ?? [],

  };
  
}



// Override the type for a specific column in a view:

