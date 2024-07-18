<script lang="ts">
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import {filteredIssuesDataStore, filteredIssuesForSnapshot, filterStoreList, nodesDataStore, selectedNodeStore} from "../../../stores";
    import IssueItem from './IssueItem.svelte';
    import FilterControls from '../Kaban/Filter.svelte';
    import ListDisplayOptions from './ListDisplayOptions.svelte';
    import * as Collapsible from "$lib/components/ui/collapsible";
    import AddButton from '../Kaban/AddButton.svelte';
    import { ChevronsUpDown    } from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button";
    import { slide } from "svelte/transition";

    import type { Issue, Node } from "../../types/collection";
    import * as ContextMenu from "$lib/components/ui/context-menu";

    let groupedIssues = [];
    export let nodes = false;

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

    function getNestedIssues(nodeId: number, nodes: Node[], issues: Issue[]): Issue[] {
  

    function findChildNodeIds(nodeId: number, nodes: Node[]): number[] {
        const childNodes = nodes.filter(node => node.parent_id === nodeId);
        let childNodeIds = childNodes.map(node => node.id);
        for (let childNode of childNodes) {
        childNodeIds = childNodeIds.concat(findChildNodeIds(childNode.id, nodes));
        }
        return childNodeIds;
    }

    const nestedNodeIds = [nodeId, ...findChildNodeIds(nodeId, nodes)];
    const filteredIssues = issues.filter(issue => issue.node_id !== null && nestedNodeIds.includes(issue.node_id));

    
    return filteredIssues;
    }



   
    // Update the board
    function updateBoard() {
        let filteredIssues = get(filteredIssuesDataStore);

        let issuesTemp;
        if (nodes && $selectedNodeStore) {
            console.log($selectedNodeStore.id, $nodesDataStore, filteredIssues);
            
            filteredIssues = getNestedIssues($selectedNodeStore.id, $nodesDataStore, filteredIssues)
        }
        console.log(filteredIssues);
        groupedIssues = groupAndSortIssues(filteredIssues, filtersFormStore.rowByField, filtersFormStore.orderByField, filtersFormStore.orderDirection);
    }



    // Initialize the board on mount


    // Subscribe to filteredIssuesDataStore
    const unsubscribe = filteredIssuesDataStore.subscribe(value => {

        
        updateBoard();
   
        
    });





</script>

<style>
    .list-container {
        height: 100%;
        padding-bottom: 50px;
        padding-top: 20px;
        overflow-y: auto;
        align-items: center;
        justify-content: center;
    }

    .header-container {
 
        padding: 10px; /* Add some padding if needed */

    }

    ul {
        background: rgb(6, 6, 8);   
        padding-bottom: 1px;
        padding-top: 1px;

    }


</style>




<div class="list-container">

    {#each groupedIssues as { key, issues }}
        <Collapsible.Root open={true}>
       
            <div class="header-containerr font-default flex items-center justify-between space-x-4 px-6  text-slate-300">
                <h1>
             
                    <span class="key font-semibold text-lg ">{key}</span> 
                    <span class="issues-count ml-1">{issues.length}</span>
                 
                </h1>
                <div>
                    <AddButton/>
                    <Collapsible.Trigger>
                    
               
                        <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0">
                            <ChevronsUpDown class="w-4 h-4 text-current group-hover:text-highlight-color" />
                        </Button>
    
                    </Collapsible.Trigger>
                </div>
                
       
            </div>
        
            <Collapsible.Content class="collapsible-content" transition={slide} transitionConfig={{ duration: 400}}>
                <ul>
                    {#each issues as issue}
                        <IssueItem {issue} {groupedIssues} />
                    {/each}
                </ul>
            </Collapsible.Content>
        </Collapsible.Root>
    {/each}
</div>