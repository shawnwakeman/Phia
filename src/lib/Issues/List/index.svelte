<script lang="ts">
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import {filteredIssuesDataStore, filteredIssuesForSnapshot, filterStoreList } from "../../../stores";
    import IssueItem from './IssueItem.svelte';
    import FilterControls from '../Kaban/Filter.svelte';
    import ListDisplayOptions from './ListDisplayOptions.svelte';
    import * as Collapsible from "$lib/components/ui/collapsible";
    import AddButton from '../Kaban/AddButton.svelte';
    
    let groupedIssues = [];
    

    let filtersFormStore = {
        rowByField: 'state',
        orderByField: 'id',
        orderDirection: 'asc',
        hideEmptyRows: false,
        hideNullRows: false,
    };


    let hydrated = false


    const unsubscribefilter = filterStoreList.subscribe(value => {
    if (hydrated) {
        filtersFormStore = value;
    // Call the required code whenever the filters are updated
        console.log('Filters updated:', filtersFormStore);
        updateBoard()

    }
        
    // Your code to handle filter changes
    hydrated = true
    });

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

        if (filtersFormStore.hideEmptyRows) {
            result = result.filter(group => group.issues.length > 0);
        }

        if (filtersFormStore.hideNullRows) {
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
   
    // Update the board
    function updateBoard() {
        const filteredIssues = get(filteredIssuesDataStore);
        groupedIssues = groupAndSortIssues(filteredIssues, filtersFormStore.rowByField, filtersFormStore.orderByField, filtersFormStore.orderDirection);
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
        height: 100%;
        overflow-y: auto;
    }
</style>




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