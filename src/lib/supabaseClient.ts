
import type { Database } from "../types/database.types";
import type { Issue, UserSettings } from "../types/collection";
import {
	issuesDataStore,
	nodesDataStore,
	addedIssue,
	targetStatesStore,
	settings,
} from "./stores";
import { get } from "svelte/store";

import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import { createBrowserClient } from "@supabase/ssr";
import type { UUID } from "crypto";
import type { SupabaseClient } from '@supabase/supabase-js';
const projectID = 1;

import { getContext } from 'svelte';

export let supabase: SupabaseClient;

export function useSupabaseClient() {
  const supabaseClient = getContext<SupabaseClient>('supabaseClient');
  if (!supabaseClient) {
    throw new Error("Supabase client not initialized.");
  }
  supabase = supabaseClient;
}




export async function signInWithGithub() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			redirectTo: "http://localhost:5173/",
		},
	});

	if (error) {
		console.error("Error during sign-in:", error);
		return;
	}

	// Wait for the OAuth redirect to complete
	console.log("Redirecting to GitHub for sign-in...");
}

// Function to get the user's data
export async function getUserData() {
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.error("Error fetching user data:", error);
		return null;
	}
	console.error(data.user);
	return data.user;
}

async function signOut() {
	const { error } = await supabase.auth.signOut();
}

interface RpcParams {
	node_id: number;
}

// This function adds a new configuration or updates an existing one based on the configKey




export async function fetchNestedIssues(nodeId: number) {
	const params: RpcParams = { node_id: nodeId };
	const { data, error } = await supabase.rpc(
		"get_nested_issues",
		params as any
	);

	if (error) {
		console.error("Error fetching nested issues:", error);
		return [];
	}

	return data;
}

// Execute the function to fetch the data

export async function addNode(
	name: string,
	value: number,
	parent_id: number | null,
	state: string
) {
	console.log(name, parent_id);

	const { data, error } = await supabase
		.from("nodes")
		.insert([
			{
				name: name,
				value: value,
				parent_id: parent_id,
				project_id: projectID,
				state: state,
				initial_state: "Open",
			},
		])
		.select();

	if (error) {
		console.error("Error adding node:", error);
		return { success: false, error: error.message };
	}

	if (data) {
		console.log("Added node:", data);

		const addedNode = data[0];
		const nodeId = addedNode.id;

		nodesDataStore.update((currentNodes) => {
			return [...currentNodes, addedNode];
		});

		return { success: true, id: nodeId };
	} else {
		console.error("No data returned from the database");
	}

	console.log("Added node:", data);
	return { success: true, data: data };
}
//  these need to be updated to refecte changes in nodestore

export async function updateNodeByID(
	nodeId: number,
	updatedValues: {
		name?: string;
		value?: number;
		parent_id?: number;
		state?: string;
	}
) {
	// Assuming `nodeId` is the ID of the node you want to update,
	// and `updatedValues` contains the new values for `name`, `value`, and `parent_id` columns.
	const { data, error } = await supabase
		.from("nodes")
		.update(updatedValues)
		.match({ id: nodeId }) // Use .match() to filter by ID or other criteria
		// Specify the columns you want to return after the update
		.select("id, name, value, parent_id, state");

	if (error) {
		console.error("Error updating node:", error);
		return null; // or handle the error as needed
	}

	// If the update is successful, `data` should contain the updated node(s)
	if (data) {
		console.log("Updated node:", data);

		// Update the nodesDataStore with the updated data
		nodesDataStore.update((currentNodes) => {
			return currentNodes.map((node) => {
				if (node.id === nodeId) {
					return { ...node, ...updatedValues };
				}
				return node;
			});
		});

		return { success: true, data: data };
	} else {
		console.error("No data returned from the database");
		// Optionally, update the store to indicate that no data was returned
		return { success: false, error: "No data returned from the database" };
	}
}

export async function updateNodeAndChildrenState(
	nodeId: number,
	newState: string
) {
	console.log("Called updateNodeAndChildrenState");

	let nodes;
	const unsubscribe = nodesDataStore.subscribe(($nodes) => {
		nodes = $nodes;
	});
	unsubscribe(); // Unsubscribe immediately to prevent memory leaks
	const allNodes = nodes;
	if (!allNodes) {
		console.error("Nodes not found");
		return;
	}

	let nodesToUpdate = new Set([nodeId]); // Start with the initial node
	let queue = [nodeId];
	while (queue.length > 0) {
		const currentId = queue.shift();
		const childNodes = allNodes.filter(
			(node) => node.parent_id === currentId
		);
		childNodes.forEach((child) => {
			nodesToUpdate.add(child.id);
			queue.push(child.id);
		});
	}

	// Convert the set of node IDs to an array for the update
	const nodeIdsToUpdate = Array.from(nodesToUpdate);

	// Update the nodes in the datastore
	nodesDataStore.update((currentNodes) => {
		return currentNodes.map((node) => {
			if (nodesToUpdate.has(node.id)) {
				return { ...node, state: newState };
			}
			return node;
		});
	});

	const { data, error } = await supabase
		.from("nodes")
		.update({ state: newState })
		.in("id", nodeIdsToUpdate);

	if (error) {
		console.error("Error updating nodes in database:", error);
		return { success: false, error: error.message };
	}

	console.log("Nodes successfully updated in database");
	return { success: true, data };
}

export async function updateNodeAndChildrenTargetState(
	nodeId: number,
	newState: string,
	snapshot: number,
	removeState: boolean = false
) {
	console.log("Called updateNodeAndChildrenState");

	let nodes;
	const unsubscribe = nodesDataStore.subscribe(($nodes) => {
		nodes = $nodes;
	});
	unsubscribe(); // Unsubscribe immediately to prevent memory leaks

	if (!nodes) {
		console.error("Nodes not found");
		return;
	}

	let nodesToUpdate = new Set<number>();
	let queue = [nodeId];

	while (queue.length > 0) {
		const currentId = queue.shift();
		if (currentId !== undefined) {
			nodesToUpdate.add(currentId);
			const childNodes = nodes.filter(
				(node) => node.parent_id === currentId
			);
			childNodes.forEach((child) => queue.push(child.id));
		}
	}

	const nodeIdsToUpdate = Array.from(nodesToUpdate);

	if (removeState) {
		// Remove target states
		targetStatesStore.update((currentTargetStates) => {
			return currentTargetStates.filter(
				(state) => !nodeIdsToUpdate.includes(state.node_id)
			);
		});

		// Prepare data for deletion

		// Delete the TargetStates in the database
		const { data, error } = await supabase
			.from("node_target_states")
			.delete()
			.match({ project_id: projectID, snapshot_id: snapshot })
			.in("node_id", nodeIdsToUpdate);

		if (error) {
			console.error("Error deleting target states in database:", error);
			return { success: false, error: error.message };
		}

		console.log("Target states successfully deleted in database and store");
		return { success: true, data };
	} else {
		// Generate temporary IDs for new target states
		let tempId = -1;
		const targetStatesUpdates = nodeIdsToUpdate.map((node_id) => ({
			id: tempId--, // Temporary negative ID
			node_id,
			project_id: projectID,
			snapshot_id: snapshot, // Default snapshot ID
			target_state: newState,
		}));

		// Update the target states store before making the database call
		targetStatesStore.update((currentTargetStates) => {
			const updatedStates = currentTargetStates.filter(
				(state) => !nodeIdsToUpdate.includes(state.node_id)
			);
			return [...updatedStates, ...targetStatesUpdates];
		});

		// Prepare data for upsert
		const upsertData = targetStatesUpdates.map(({ id, ...rest }) => rest);

		// Update the TargetStates in the database
		const { data, error } = await supabase
			.from("node_target_states")
			.upsert(upsertData, {
				onConflict: ["node_id", "project_id", "snapshot_id"],
			});

		if (error) {
			console.error("Error updating target states in database:", error);
			return { success: false, error: error.message };
		}

		console.log("Target states successfully updated in database and store");
		return { success: true, data };
	}
}

export async function updateNodeNameByID(nodeId: number, newName: string) {
	const { data, error } = await supabase
		.from("nodes")
		.update({ name: newName })
		.match({ id: nodeId })
		.select("id, name");

	if (error) {
		console.error("Error updating node name:", error);
		return { success: false, error: error.message };
	}

	if (data) {
		console.log("Updated node name:", data);

		// Update the nodesDataStore with the updated name
		nodesDataStore.update((currentNodes) => {
			return currentNodes.map((node) => {
				if (node.id === nodeId) {
					return { ...node, name: newName };
				}
				return node;
			});
		});

		return { success: true, data: data };
	} else {
		console.error("No data returned from the database");
		// Optionally, update the store to indicate that no data was returned
		return { success: false, error: "No data returned from the database" };
	}
}

let totalDataTransferred = 0;

export async function saveSummary(
	nodeId: number,
	summaryContent: JSONContent = {
		type: "doc",
		content: [{}],
	},
	sessionId: UUID,
	table: string
) {
	const { data, error } = await supabase
		.from(table)
		.upsert(
			{ node_id: nodeId, summary: summaryContent, sessionID: sessionId },
			{ onConflict: "node_id" }
		);

	if (error) {

		console.error("Error saving summary:", error, supabase);
	} else {
		console.log("Summary saved:", data);
	}
}

export async function saveSummaryChanges(
	nodeId: number,
	changes: any,
	sessionId: UUID,
	table: string
) {
	const { data, error } = await supabase.from(table).upsert(
		{
			node_id: nodeId,
			changes: changes,
			sessionID: sessionId,
		},
		{ onConflict: "node_id" }
	);

	if (error) {
		console.error("Error saving summary changes:", error);
	} else {
		console.log("Summary changes saved:", data);
	}
}

export async function fetchSummary(nodeId: number, table: string) {
	const defaultSummary = {
		type: "doc",
		content: [{}],
	};
	console.log();
	
	const { data, error } = await supabase
		.from(table)
		.select("summary")
		.eq("node_id", nodeId)
		.single();

	if (error) {
		console.error("Error fetching summary:", error);
		return defaultSummary;
	}

	return data.summary;
}

export async function deleteNodeById(nodeId: number) {
	const { data, error } = await supabase
		.from("nodes")
		.delete()
		.match({ id: nodeId });

	if (error) {
		console.error("Error deleting node:", error);
		return { success: false, error: error.message };
	}

	nodesDataStore.update((currentNodes) => {
		return currentNodes.filter((node) => node.id !== nodeId);
	});
}

export async function findRootNodes() {
	const { data, error } = await supabase
		.from("nodes") // Replace 'nodes' with your actual table name
		.select("*") // Selects all columns, replace '*' with specific columns if needed
		.is("parent_id", null); // Finds nodes where 'parent_id' is NULL

	if (error) {
		console.error("Error fetching root nodes:", error);
		return;
	}

	return data; // Contains the rows of nodes with 'parent_id' NULL
}

/// isssues crud -----

export async function addIssue(
	parent_id,
	name,
	description,
	state,
	priority,
	cycle,
	tags,
	due_date,
	creator,
	assignee,
) {
	if (!parent_id) {
		console.error("Parent ID is null");
		return;
	}

	const currentTimestamp = new Date().toISOString();

	// Create a temporary issue object with a temporary ID
	const tempIssue = {
		description: "need to remove",
		node_id: parent_id,
		project_id: projectID,
		priority,
		state,
		name,
		cycle,
		tags,
		due_date,
		creator_id: creator, // Replace with actual creator ID
		assignee: assignee,
		completed_at: null,
		created_at: currentTimestamp,
	};

	// Update the store immediately with the temporary issue
	issuesDataStore.update((currentIssues) => [...currentIssues, tempIssue]);

	// Proceed with the database insert
	const { data, error } = await supabase
		.from("issues")
		.insert([
			{
				description: "need to remove",
				node_id: parent_id,
				project_id: projectID,
				priority,
				state,
				name,
				cycle,
				tags,
				due_date,
				creator_id: creator, // Replace with actual creator ID
				assignee: assignee,
				completed_at: null,
				created_at: currentTimestamp,
			},
		])
		.select();

	if (data) {
		console.log("Added issue:", data);

		saveSummary(data[0].id, description, null, "summaries_issues");

		// Replace the temporary issue with the issue from the database
		issuesDataStore.update((currentIssues) => {
			const newIssue = data[0];
			return currentIssues.map((issue) =>
				issue.id === tempIssue.id ? newIssue : issue
			);
		});

		addedIssue.set(true);
	} else {
		console.error("No data returned from the database", error);
		// Optionally, handle the error case (e.g., remove the temporary issue)
		issuesDataStore.update((currentIssues) =>
			currentIssues.filter((issue) => issue.id !== tempIssue.id)
		);
	}

	return { success: !!data, data: data };
}

function sanitizeIssue(rawIssue: any): Issue {
	return {
		created_at: rawIssue.created_at
			? new Date(rawIssue.created_at).toISOString()
			: null,
		customcolumns: rawIssue.customcolumns, // Assuming this needs to be a JSON object; validation might be needed depending on use case
		description: String(rawIssue.description),
		id: Number(rawIssue.id),
		name: String(rawIssue.name),
		node_id: rawIssue.node_id === null ? null : Number(rawIssue.node_id),
		priority: rawIssue.priority === null ? null : String(rawIssue.priority),
		state: rawIssue.state === null ? null : String(rawIssue.state),
		columnIndex: Number(rawIssue.columnIndex),
		creator_id:
			rawIssue.creator_id === null ? null : Number(rawIssue.creator_id), // Assuming creator_id can be null
		completed_at: rawIssue.completed_at
			? new Date(rawIssue.completed_at).toISOString()
			: null,
		due_date: rawIssue.due_date
			? new Date(rawIssue.due_date).toISOString()
			: null,
		assignee: rawIssue.assignee === null ? null : String(rawIssue.assignee),
		cycle: rawIssue.cycle === null ? null : String(rawIssue.cycle),
		tags: rawIssue.tags === null ? null : String(rawIssue.tags),
		project_specific_id:
			rawIssue.project_specific_id === null
				? null
				: Number(rawIssue.project_specific_id),
	};
}

export async function updateIssue(issue: Issue) {
	// Assuming 'Issue' includes an 'id' field

	if (!issue || !issue.id) {
		console.error("Issue or Issue ID is null or undefined");
		return { success: false, error: "Invalid issue object" };
	}

	issue = sanitizeIssue(issue);

	// Update the issue in the database
	const { data, error } = await supabase
		.from("issues")
		.update({
			// Specify the fields to update
			description: issue.description,
			node_id: issue.node_id,
			project_id: issue.project_id,
			priority: issue.priority,
			state: issue.state,
			name: issue.name,
			creator_id: issue.creator_id,
			assignee: issue.assignee,
			cycle: issue.cycle,
			tags: issue.tags,
			project_specific_id: issue.project_specific_id,
		})
		.eq("id", issue.id); // Match the issue 'id' for updating

	if (error) {
		console.error("Failed to update issue:", error);
		return { success: false, error: error.message };
	}

	console.log("Updated issue:", data);

	// Optionally, update the local issues store to reflect the update
	issuesDataStore.update((currentIssues) => {
		const index = currentIssues.findIndex((i) => i.id === issue.id);
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
		console.error("Issue ID is null");
		// Optionally, you can update the store with an error or handle this case as needed
		return { success: false, error: "Issue ID is null" };
	}

	console.log("dasd", issue.id);

	const { data, error } = await supabase
		.from("issues")
		.delete()
		.match({ id: issue.id }); // Adjust the column name if your identifier column is named differently

	if (error) {
		console.error("Failed to delete issue:", error);
		// Optionally, update the store or handle the error as needed
		return { success: false, error: error };
	}

	console.log("Deleted issue:", data);
	// Optionally, update the issuesDataStore to remove the deleted issue
	issuesDataStore.update((currentIssues) => {
		return currentIssues.filter(
			(currentIssue) => currentIssue.id !== issue.id
		);
	});
	return { success: true, data: data };
}

async function uploadFileToNodeFolder(nodeId: number, file) {
	// Assuming `userId` and `nodeId` are available and valid
	// const bucketName = `bucket-${userId}`; // Construct the bucket name based on user ID
	const bucketName = `testBucket`;
	const nodeName = await getNodeNameById(nodeId); // Retrieve the node name from your database
	const filePath = `${nodeName}/${file.name}`; // Construct the file path with the node name

	const { data, error } = await supabase.storage
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
	return "exampleNodeName"; // Placeholder return
}

//////////////////////////////////////////////////////////////
//                           Blocks                         //
//////////////////////////////////////////////////////////////

// export async function fetchNestedIssues(nodeId: number) {
//     const params: RpcParams = { node_id: nodeId };
//     const { data, error } = await supabase
//         .rpc('get_nested_issues', params as any);

//     if (error) {
//         console.error('Error fetching nested issues:', error);
//         return [];
//     }

//     return data;
// }

export async function createSnapshot(
	projectID: number,
	startDate: Date,
	end_date: Date
) {
	// Call the RPC to create a snapshot and copy nodes
	const { data: newSnapshot, error: insertError } = await supabase
		.from("snapshots")
		.insert({
			created_at: startDate.toISOString(),
			end_date: end_date.toISOString(),
			project_id: projectID,
		})
		.select()
		.single();

	if (insertError) {
		console.error("Error creating new snapshot:", insertError);
		throw new Error("Failed to create new snapshot");
	}

	return newSnapshot;
}

export async function deleteSnapshot(snapshotID: number) {
	const { data, error } = await supabase
		.from("snapshots")
		.delete()
		.match({ snapshot_id: snapshotID });

	if (error) {
		console.error("Error deleting snapshot:", error);
		return { success: false, error: error.message };
	}

	console.log("Deleted snapshot:", data);
	return { success: true, data: data };
}

export async function loadSnapshots(projectID: number) {
	const { data, error } = await supabase
		.from("snapshots")
		.select("snapshot_id, created_at")
		.eq("project_id", projectID)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error loading snapshots:", error);
		return { success: false, error: error.message };
	}

	console.log("Loaded snapshots:", data);
	return { success: true, data: data };
}

function setNestedProperty(obj: UserSettings, path: string, value: any) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const lastObj = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
    if (lastKey) {
      lastObj[lastKey] = value;
    }
}
  

  export async function setSetting(newSettings: any, id: string | null = null) {
    if (!id) {
      const { data: { session } } = await supabase.auth.getSession();
      id = session?.user?.id;
      if (id) {
			const { error } = await supabase
			.from("user_settings")
			.upsert({ id, settings: newSettings }, { onConflict: "id" });
		
		if (error) {
			console.error("Error updating settings:", error);
			throw error;
		}
	  } else {
		  console.error("No user ID available")
	  }
    }
  
    // Update the settings in Supabase
   
  }



