<script>
    import { createSnapshot, deleteSnapshot, loadSnapshots } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

    let projectID = 1; // Set this to your current project's ID
    let snapshots = [];
    let error = '';

    // Function to call when creating a snapshot
    async function handleCreateSnapshot() {
        const result = await createSnapshot(projectID);
        if (!result.success) {
            error = result.error;
        } else {
            // Optionally refresh the list of snapshots after creating a new one
            fetchSnapshots();
        }
    }

    // Function to load all snapshots for a project
    async function fetchSnapshots() {
        const result = await loadSnapshots(projectID);
        if (result.success) {
            snapshots = result.data;
        } else {
            error = result.error;
        }
    }

    // Load snapshots on component mount
    onMount(() => {
        fetchSnapshots();
    });
</script>

<!-- Display any errors -->
{#if error}
    <p class="error">{error}</p>
{/if}

<button on:click={handleCreateSnapshot}>Create Snapshot</button>
<button on:click={fetchSnapshots}>Load Snapshots</button>

<!-- Display list of snapshots -->
 <h1>asdasdasdas</h1>
 <h1>asdasdasdas</h1>
 <h1>asdasdasdas</h1>
 <h1>asdasdasdas</h1>
<ul>
    {#each snapshots as snapshot}
        <li>
            Snapshot ID: {snapshot.snapshot_id}, Created At: {snapshot.created_at}
            <!-- Button to delete a snapshot -->
            <button on:click={() => deleteSnapshot(snapshot.snapshot_id)}>Delete</button>
        </li>
    {/each}
</ul>
