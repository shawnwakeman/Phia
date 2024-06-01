<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { writable, get } from 'svelte/store';
    import { issuesDataStore, filteredIssuesDataStore } from "../../../stores";

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
        const optionsCount = $issuesDataStore.reduce((acc, issue) => {
            const value = issue[field];
            if (value === null || value === undefined) {
                acc[`no ${field}`] = (acc[`no ${field}`] || 0) + 1;
            } else {
                acc[value] = (acc[value] || 0) + 1;
            }
            return acc;
        }, {});

        filterOptions.update(currentOptions => {
            currentOptions[field] = Object.entries(optionsCount).map(([option, count]) => ({
                label: `${option} (${count})`,
                value: option === `no ${field}` ? null : option,
                checked: get(filters)[field]?.has(option === `no ${field}` ? null : option) ?? false
            }));
            return { ...currentOptions };
        });
    }

    function filterIssues(data, filters, filterInclusions) {
        let filteredData = data;

        Object.entries(filters).forEach(([field, options]) => {
            const inclusion = filterInclusions[field] === 'is' || filterInclusions[field] === undefined;
            filteredData = filteredData.filter(issue => inclusion ? options.has(issue[field]) : !options.has(issue[field]));
        });

        return filteredData;
    }

    export function updateBoard() {
        const currentFilters = get(filters);
        const currentFilterInclusions = get(filterInclusions);
        const filteredIssues = filterIssues($issuesDataStore, currentFilters, currentFilterInclusions);
        filteredIssuesDataStore.set(filteredIssues);
    }

    function resetDisplayBehavior() {
        selectedFilterFieldValue = '';
    }

    function getFilterDisplayText(field) {
        const selectedOptions = Array.from(get(filters)[field] || []);
        return selectedOptions.length > 0 
            ? selectedOptions.map(option => option === null ? `no ${field}` : option).join(', ') 
            : 'No filter selected';
    }
</script>

<DropdownMenu.Root closeOnItemClick={false} onOutsideClick={resetDisplayBehavior}>
    <DropdownMenu.Trigger>
        {selectedFilterFieldValue ? 'Select Filter Option' : 'Select Filter Field'}
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

<div>
    <h3>Active Filters:</h3>
    <ul>
        {#each Object.entries($filters) as [field, options]}
            <li>
                {filterFields.find(f => f.value === field).label}
                <button on:click={() => handleInclusionToggle(field)}>
                    {$filterInclusions[field] || 'is'}
                </button>
                <DropdownMenu.Root closeOnItemClick={false} onOutsideClick={resetDisplayBehavior}>
                    <DropdownMenu.Trigger>
                        {getFilterDisplayText(field)}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
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
                <button on:click={() => Array.from(options).forEach(option => removeFilter(field, option))}>Remove</button>
            </li>
        {/each}
    </ul>
</div>
