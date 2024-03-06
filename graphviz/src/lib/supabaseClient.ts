import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
)





  
export async function addNode(name: string, value: number, parent_id: number | null) {
    const { data, error } = await supabase
        .from('nodes')
        .insert([
            { name: name, value: value, parent_id: parent_id }
        ]);

    if (error) {
        console.error('Error adding node:', error);
        return { success: false, error: error.message };
    }

    console.log('Added node:', data);
    return { success: true, data: data };
}


  
export async function updateNodeByID(nodeId: number, updatedValues: {
    name?: string;
    value?: number;
    parent_id?: number;
}) {
    // Assuming `nodeId` is the ID of the node you want to update,
    // and `updatedValues` contains the new values for `name`, `value`, and `parent_id` columns.
    const { data, error } = await supabase
        .from('nodes')
        .update(updatedValues)
        .match({ id: nodeId }) // Use .match() to filter by ID or other criteria
        // Specify the columns you want to return after the update
        .select('id, name, value, parent_id');

    if (error) {
        console.error('Error updating node:', error);
        return null; // or handle the error as needed
    }

    // If the update is successful, `data` should contain the updated node(s)
    console.log('Updated node:', data);
    return data;
}


export async function deleteNodeById(nodeId: number) {
    const { data, error } = await supabase
        .from('nodes')
        .delete()
        .match({ id: nodeId });

    if (error) {
        console.error('Error deleting node:', error);
        return { success: false, error: error.message };
    }

    console.log('Deleted node:', data);
    return { success: true, data: data };
}




  



    


    


