import { supabase } from "$lib/supabaseClient";
import { get } from 'svelte/store';
import { nodesDataStore } from '../stores';


export async function load() {
	const currentNodes = get(nodesDataStore);

	
		console.log("loading loa", currentNodes);
		
		const { data, error } = await supabase
		.from('nodes')
			.select();
		
		return {
			nodes: data ?? [],
		};


	

	

}





// Override the type for a specific column in a view:

