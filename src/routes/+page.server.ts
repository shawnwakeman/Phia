import { supabase } from "$lib/supabaseClient";
import { get } from 'svelte/store';
import { nodesDataStore } from '../stores';


export async function load() {
	const currentNodes = get(nodesDataStore);

	if (currentNodes.length === 0) {
		const { data, error } = await supabase
		.from('nodes')
			.select();
		
		return {
			nodes: data ?? [],
		};
	} else {
		return {
			nodes: currentNodes ?? [],
		};
	}

	

	

}





// Override the type for a specific column in a view:

