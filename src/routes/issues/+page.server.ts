import { supabase, fetchNestedIssues } from '$lib/supabaseClient';
import { get } from 'svelte/store'; // Import get to use with Svelte stores
import { selectedNodeStore } from "../../stores";
import type { Issue } from "../../types/collection";

export async function load({ fetch }) {
    // Assuming Issue is an array type, if it's not, you'll need to adjust this according to your type definitions.
    let issues: Issue[] = []; // Ensure this matches your TypeScript definition for an array of issues

    // Use `get` to subscribe and get the current value of the store
    const selectedNode = get(selectedNodeStore);
    console.error(selectedNode);
    if (selectedNode) {
        // Await the async operation to ensure issues are fetched before proceeding
        issues = await fetchNestedIssues(selectedNode.id);
 
        
    }


    // Fetch nodes from supabase
    const { data, error } = await supabase.from('nodes').select();

    if (error) {
        console.error("Supabase error:", error);
        // Handle error appropriately, perhaps returning an error state or message
    }

    return {
        props: { // Make sure to wrap your return values in a `props` object
            nodes: data,
            issues: issues // Ensure this variable is used correctly in your component
        }

    };
}
