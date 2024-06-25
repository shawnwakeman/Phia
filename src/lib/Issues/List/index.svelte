<script lang="ts">
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import {filteredIssuesDataStore, filteredIssuesForSnapshot } from "../../../stores";
    import IssueItem from './IssueItem.svelte';
    import FilterControls from '../Kaban/Filter.svelte';
    import ListDisplayOptions from './ListDisplayOptions.svelte';
    import * as Collapsible from "$lib/components/ui/collapsible";
    import AddButton from '../Kaban/AddButton.svelte';
    
    let groupedIssues = [];
    let rowByField = 'state';
    let orderByField = 'id';
    let orderDirection = 'asc';
    let hideEmptyRows = false;
    let hideNullRows = false;
    let notFirstLoad = false;

    let filters = [];
    let searchQuery = '';

    const Configs = {
        state: [
            { id: 0, name: 'Open' },
            { id: 1, name: 'DOING' },
            { id: 2, name: 'DONE' },
        ],
        priority: [
            { id: 0, name: 'High' },
            { id: 1, name: 'Medium' },
            { id: 2, name: 'Low' },
        ],
    };

    function groupAndSortIssues(data, groupBy, orderBy, orderDir) {
        if (groupBy === 'none') {
            const sortedIssues = [...data].sort((a, b) => {
                const sortResult = customSort(a, b, orderBy);
                return orderDir === 'asc' ? sortResult : -sortResult;
            });
            return [{ key: 'All Issues', issues: sortedIssues }];
        }

        const config = Configs[groupBy];
        const grouped = config.reduce((acc, configItem) => {
            acc[configItem.name] = [];
            return acc;
        }, {});

        data.forEach(issue => {
            const groupKey = issue[groupBy] || `No ${groupBy}`;
            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(issue);
        });

        Object.values(grouped).forEach(group => {
            group.sort((a, b) => {
                const sortResult = customSort(a, b, orderBy);
                return orderDir === 'asc' ? sortResult : -sortResult;
            });
        });

        let result = Object.entries(grouped).map(([key, issues]) => ({ key, issues }));

        if (hideEmptyRows) {
            result = result.filter(group => group.issues.length > 0);
        }

        if (hideNullRows) {
            result = result.filter(group => group.key !== `No ${groupBy}`);
        }
        console.log(result);
        
        return result;
    }

    function customSort(a, b, field) {
        if (a[field] === null || a[field] === undefined) return 1;
        if (b[field] === null || b[field] === undefined) return -1;
        if (field === 'id') return a.id - b.id;
        if (field === 'name') return a.name.localeCompare(b.name);
        if (field === 'priority') return a.priority - b.priority;
        if (field === 'state') return a.state.localeCompare(b.state);
        return 0;
    }

    // Handle display option changes
    function handleRowByChange(event) {
        rowByField = event.detail;
        updateBoard();
    }

    function handleOrderByChange(event) {
        orderByField = event.detail;
        updateBoard();
    }

    function handleOrderDirectionChange(event) {
        orderDirection = event.detail;
        updateBoard();
    }

    function handleHideEmptyRowsChange(event) {
        hideEmptyRows = event.detail;
        updateBoard();
    }

    function handleHideNullRowsChange(event) {
        hideNullRows = event.detail;
        updateBoard();
    }

    // Update the board
    function updateBoard() {
        const filteredIssues = get(filteredIssuesDataStore);
        groupedIssues = groupAndSortIssues(filteredIssues, rowByField, orderByField, orderDirection);
    }

    // Initialize the board on mount
    onMount(() => {

        updateBoard();
    });

    // Subscribe to filteredIssuesDataStore
    const unsubscribe = filteredIssuesDataStore.subscribe(value => {

        
        updateBoard();
   
        
    });





</script>

<style>
    .list-container {
        overflow-y: auto;
    }
</style>
<AddButton/>


<ListDisplayOptions
    bind:rowByField
    bind:orderByField
    bind:orderDirection
    bind:hideEmptyRows
    bind:hideNullRows
    on:rowByChange={handleRowByChange}
    on:orderByChange={handleOrderByChange}
    on:orderDirectionChange={handleOrderDirectionChange}
    on:hideEmptyRowsChange={handleHideEmptyRowsChange}
    on:hideNullRowsChange={handleHideNullRowsChange}
/>

<div class="list-container">
    <h3>Issues List:</h3>
    {#each groupedIssues as { key, issues }}
        <Collapsible.Root open={true}>
            <AddButton/>
            <Collapsible.Trigger class="collapsible-header"><h1>{key}</h1></Collapsible.Trigger>
            <Collapsible.Content class="collapsible-content">
                <ul>
                    {#each issues as issue}
                        <IssueItem {issue} {groupedIssues} />
                    {/each}
                </ul>
            </Collapsible.Content>
        </Collapsible.Root>
    {/each}
</div>