<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { writable, get } from 'svelte/store';
    import {filteredIssuesDataStore, filteredIssuesForSnapshot } from "../../../stores";
    import { Filter, Trash2 } from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button/index.js";
    const filterFields = [
        { label: 'State', value: 'state' },
        { label: 'Priority', value: 'priority' },
        { label: 'Cycle', value: 'cycle' },
        { label: 'Assignee', value: 'assignee' }
    ];

    let selectedFilterFieldValue = '';

    const filters = writable({});
    const filterOptions = writable({});
    const filterInclusions = writable({});

    const dispatch = createEventDispatcher();

    function removeFilter(field, option) {
        filters.update(currentFilters => {
            if (currentFilters[field]) {
                currentFilters[field].delete(option);
                if (currentFilters[field].size === 0) {
                    delete currentFilters[field];
                }
            }
            return { ...currentFilters };
        });
        updateFilterOptions(field);
        updateBoard();
    }

    function handleFilterFieldChange(fieldValue) {
        selectedFilterFieldValue = fieldValue;
        updateFilterOptions(selectedFilterFieldValue);
    }

    function handleFilterOptionChange(field, option) {
        
        
        filters.update(currentFilters => {
            if (currentFilters[field]?.has(option)) {
                currentFilters[field].delete(option);
                if (currentFilters[field].size === 0) {
                    delete currentFilters[field];
                }
            } else {
                if (!currentFilters[field]) {
                    currentFilters[field] = new Set();
                }
                currentFilters[field].add(option);
            }
            return { ...currentFilters };
        });
        updateBoard();
    }

    function handleInclusionToggle(field) {
        filterInclusions.update(currentInclusions => {
            const currentInclusion = currentInclusions[field] || 'is'; // Set initial inclusion to 'is' if it doesn't exist
            currentInclusions[field] = currentInclusion === 'is' ? 'is not' : 'is';
            return { ...currentInclusions };
        });
        updateBoard();
    }

    function updateFilterOptions(field) {
        const optionsCount = get(filteredIssuesForSnapshot).reduce((acc, issue) => {
            const value = issue[field];
            const key = value === null || value === undefined ? `no ${field}` : value.toString();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        filterOptions.update(currentOptions => {
            currentOptions[field] = Object.entries(optionsCount).map(([option, count]) => ({
                label: `${option} (${count})`,
                value: option === `no ${field}` ? null : isNaN(Number(option)) ? option : Number(option),
                checked: get(filters)[field]?.has(option === `no ${field}` ? null : isNaN(Number(option)) ? option : Number(option)) ?? false
            }));
            return { ...currentOptions };
        });
    }

    function filterIssues(data, filters, filterInclusions) {
        let filteredData = data;

        Object.entries(filters).forEach(([field, options]) => {
            const inclusion = filterInclusions[field] === 'is' || filterInclusions[field] === undefined;
            filteredData = filteredData.filter(issue => {
                const value = issue[field];
                return inclusion ? options.has(value) : !options.has(value);
            });
        });

        return filteredData;
    }


    export function updateBoard() {

        
        const currentFilters = get(filters);
        const currentFilterInclusions = get(filterInclusions);
        const filteredIssues = filterIssues($filteredIssuesForSnapshot, currentFilters, currentFilterInclusions);
        filteredIssuesDataStore.set(filteredIssues);
        
    }

    function resetDisplayBehavior() {
        selectedFilterFieldValue = '';
    }

    function getFilterDisplayText(field) {
        const selectedOptions = Array.from(get(filters)[field] || []);
 
        return selectedOptions.length > 1
            ? 'multiple'
            : selectedOptions.length === 1
            ? selectedOptions[0] === null ? `no ${field}` : selectedOptions[0]
            : 'No filter selected';
    }




</script>


<DropdownMenu.Root closeOnItemClick={false} onOutsideClick={resetDisplayBehavior}>
    <DropdownMenu.Trigger>
        <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0">
            <Filter class="w-4 h-4 text-current group-hover:text-highlight-color" />
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        {#if !selectedFilterFieldValue}
            <DropdownMenu.Group>
                <DropdownMenu.Label>Filter Fields</DropdownMenu.Label>
                <DropdownMenu.Separator />
                {#each filterFields as field}
                    <DropdownMenu.Item on:click={() => handleFilterFieldChange(field.value)}>
                        {field.label}
                    </DropdownMenu.Item>
                {/each}
            </DropdownMenu.Group>
        {:else}
            <DropdownMenu.Group>
                <DropdownMenu.Label>Filter Options</DropdownMenu.Label>
                <DropdownMenu.Separator />
                {#each $filterOptions[selectedFilterFieldValue] as option}
                    <DropdownMenu.CheckboxItem
                        checked={option.checked}
                        onCheckedChange={() => handleFilterOptionChange(selectedFilterFieldValue, option.value)}>
                        {option.label}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Group>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>


<style>
    .filters-container {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        overflow-x: auto;
    }

    .filter-item {
        display: flex;
        align-items: center;
        margin-right: 10px;
        white-space: nowrap; /* Ensures the text does not wrap */
    }

    .filter-item > * {
        margin-right: 5px;
    }

    .dropdown-content {
        display: inline-block;
    }

    h3 {
        margin-right: 10px;
        white-space: nowrap; /* Ensures the text does not wrap */
    }
</style>

<div class="filters-container">
  
    {#each Object.entries($filters) as [field, options]}
        <div class="filter-item">
            <span>{filterFields.find(f => f.value === field).label}</span>
            <button on:click={() => handleInclusionToggle(field)}>
                {$filterInclusions[field] || 'is'}
            </button>
            <DropdownMenu.Root closeOnItemClick={false} onOutsideClick={resetDisplayBehavior}>
                <DropdownMenu.Trigger>
                    {getFilterDisplayText(field)}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="dropdown-content">
                    <DropdownMenu.Group>
                        <DropdownMenu.Label>Change Option</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        {#each $filterOptions[field] as option}
                            <DropdownMenu.CheckboxItem
                                checked={$filters[field]?.has(option.value) ?? false}
                                onCheckedChange={() => handleFilterOptionChange(field, option.value)}>
                                {option.label}
                            </DropdownMenu.CheckboxItem>
                        {/each}
                    </DropdownMenu.Group>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
     
            <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0" on:click={() => Array.from(options).forEach(option => removeFilter(field, option))}>
                <Trash2 class="w-4 h-4 text-current group-hover:text-highlight-color" />
            </Button>


        </div>
    {/each}
</div>