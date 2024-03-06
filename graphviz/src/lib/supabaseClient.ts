import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
)





  
export async function addNode() {
    const { data, error } = await supabase.from('nodes')
    .insert([
      { name: 'otherValue', value: 10, parent_id: 1 },
    ])
    if (error) throw new Error(error.message);
    return data;
}


  
export async function updateNode() {
    const { data, error } = await supabase.from('nodes')
    .insert([
      { name: 'otherValue', value: 10, parent_id: 1 },
    ])
    if (error) throw new Error(error.message);
    return data;
}


  
export async function deleteNode() {
    const { data, error } = await supabase.from('nodes')
    .insert([
      { name: 'otherValue', value: 10, parent_id: 1 },
    ])
    if (error) throw new Error(error.message);
    return data;
}
    




  



    


    


