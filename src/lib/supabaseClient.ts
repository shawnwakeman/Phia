
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'
import type { Issue, Config } from '../types/collection'
import { issuesDataStore, nodesDataStore, addedIssue } from "../stores";
import { get } from 'svelte/store';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
)



interface RpcParams {
    node_id: number;
}



// This function adds a new configuration or updates an existing one based on the configKey
export async function addOrUpdateConfig(configKey: string, configValue: any) {
    const { data, error } = await supabase
        .from('configurations')
        .upsert({
            config_key: configKey,
            config_value: configValue
        }, {
            onConflict: 'config_key'
        });

    if (error) {
        console.error('Error adding/updating config:', error);
        return { success: false, error };
    }

    return { success: true, data };
}



export async function fetchConfig(configKey: string) {
    let { data, error } = await supabase
        .from('configurations') // Assuming your table name is 'configurations'
        .select('*')
        .eq('config_key', configKey);

    if (error) {
        console.error('Error fetching config:', error);
        return null;
    }

    return data;
}

  
export async function fetchNestedIssues(nodeId: number) {
    const params: RpcParams = { node_id: nodeId };
    const { data, error } = await supabase
        .rpc('get_nested_issues', params as any);


    
    if (error) {
        console.error('Error fetching nested issues:', error);
        return [];
    }


    return data;
}

// Execute the function to fetch the data


  
export async function addNode(name: string, value: number, parent_id: number | null) {
    console.log(name, parent_id);
    
    const { data, error } = await supabase
        .from('nodes')
        .insert([
            { name: name, value: value, parent_id: parent_id }
        ])
        .select();

    if (error) {
        console.error('Error adding node:', error);
        return { success: false, error: error.message };
    }

    
    if (data) {
        console.log('Added issue:', data);

        // Update the issuesDataStore with the new data
        nodesDataStore.update(currentIssues => {
            const newIssue = data[0]; // Assuming the inserted data is returned
            
            
            
            return [...currentIssues, newIssue];
        });

    } else {
        console.error('No data returned from the database');
        // Optionally, update the store to indicate that no data was returned
    }

    console.log('Added node:', data);
    return { success: true, data: data };
}

//  these need to be updated to refecte changes in nodestore
  
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


export async function findRootNodes() {
    const { data, error } = await supabase
      .from('nodes') // Replace 'nodes' with your actual table name
      .select('*') // Selects all columns, replace '*' with specific columns if needed
      .is('parent_id', null); // Finds nodes where 'parent_id' is NULL
  
    if (error) {
      console.error('Error fetching root nodes:', error);
      return;
    }
  
    return data; // Contains the rows of nodes with 'parent_id' NULL
  }


  
/// isssues crud -----





export async function addIssue(parent_id: number | null,) {
    
    if (!parent_id) {
        console.error('Parent ID is null');
        // Optionally, you can update the store with an error or handle this case as needed
        return;
    }


        const { data, error } = await supabase
            .from('issues')
            .insert([
                {
                    description: '', // Empty string as default
                    node_id: parent_id, // Assuming 0 as a placeholder, adjust accordingly
                    priority: null, // Assuming null as an appropriate default
                    state: null, // Assuming null as an appropriate default
                    name: '', // Empty string as default
                }
            ])
            .select()
            
        
        

        if (data) {
            console.log('Added issue:', data);
            console.error(get(issuesDataStore));
            addedIssue.set(true)
            // Update the issuesDataStore with the new data
            issuesDataStore.update(currentIssues => {
                const newIssue = data[0]; // Assuming the inserted data is returned
                
                
                return [...currentIssues, newIssue];
            });

            console.error(get(issuesDataStore));
        } else {
            console.error('No data returned from the database');
            // Optionally, update the store to indicate that no data was returned
    }
    


        return { success: true, data: data };




}


function sanitizeIssue(rawIssue: any): Issue {
    return {
        created_at: String(rawIssue.created_at),
        customcolumns: rawIssue.customcolumns, // Assuming this needs to be a JSON object; validation might be needed depending on use case
        description: String(rawIssue.description),
        id: Number(rawIssue.id),
        name: String(rawIssue.name),
        node_id: rawIssue.node_id === null ? null : Number(rawIssue.node_id),
        priority: rawIssue.priority === null ? null : String(rawIssue.priority),
        state: rawIssue.state === null ? null : String(rawIssue.state),
        columnIndex: Number(rawIssue.columnIndex)
    };
}



export async function updateIssue(issue: Issue) { // Assuming 'Issue' includes an 'id' field
    if (!issue || !issue.id) {
        console.error('Issue or Issue ID is null or undefined');
        return { success: false, error: 'Invalid issue object' };
    }

    issue = sanitizeIssue(issue)


    // Update the issue in the database
    const { data, error } = await supabase
        .from('issues')
        .update({
        // Specify the fields to update
            description: issue.description,
            node_id: issue.node_id,
            priority: issue.priority,
            state: issue.state,
            name: issue.name,
            columnIndex: issue.columnIndex
        })
        .eq('id', issue.id); // Match the issue 'id' for updating

    if (error) {
        console.error('Failed to update issue:', error);
        return { success: false, error: error.message };
    }
    
    console.log('Updated issue:', data);

    // Optionally, update the local issues store to reflect the update
    issuesDataStore.update(currentIssues => {
        const index = currentIssues.findIndex(i => i.id === issue.id);
        if (index !== -1) {
        const updatedIssues = [...currentIssues];
        updatedIssues[index] = { ...updatedIssues[index], ...issue };
        return updatedIssues;
        }
        return currentIssues;
    });

    return { success: true, data: data };
}


export async function deleteIssue(issue: Issue) {
    if (!issue.id) {
        console.error('Issue ID is null');
        // Optionally, you can update the store with an error or handle this case as needed
        return { success: false, error: 'Issue ID is null' };
    }

    console.log("dasd", issue.id);
    

    const { data, error } = await supabase
        .from('issues')
        .delete()
        .match({ id: issue.id }); // Adjust the column name if your identifier column is named differently

    if (error) {
        console.error('Failed to delete issue:', error);
        // Optionally, update the store or handle the error as needed
        return { success: false, error: error };
    } 

    console.log('Deleted issue:', data);
    // Optionally, update the issuesDataStore to remove the deleted issue
    issuesDataStore.update(currentIssues => {
        return currentIssues.filter(currentIssue => currentIssue.id !== issue.id);
    });
    return { success: true, data: data };
    
}






async function uploadFileToNodeFolder(nodeId: number, file) {
    // Assuming `userId` and `nodeId` are available and valid
    // const bucketName = `bucket-${userId}`; // Construct the bucket name based on user ID
    const bucketName = `testBucket`;
    const nodeName = await getNodeNameById(nodeId); // Retrieve the node name from your database
    const filePath = `${nodeName}/${file.name}`; // Construct the file path with the node name
  
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file);
  
    if (error) {
      throw error;
    }
  
    return data; // Returns the uploaded file's data, including its path
  }
  
  // Function to retrieve the node name by its ID (simplified example)
  async function getNodeNameById(nodeId: number) {
    // Your logic here to retrieve the node name based on its ID from your database
    // This is a placeholder function. You'll need to implement this based on your actual database schema and logic.
    return 'exampleNodeName'; // Placeholder return
  }
