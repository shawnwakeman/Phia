<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { issuesDataStore, filteredIssuesDataStore } from "../../../stores";
    import IssueItem from './IssueItem.svelte';
    import FilterControls from '../Kaban/Filter.svelte';
    import ListDisplayOptions from './ListDisplayOptions.svelte';
  
    let groupedIssues = [];
    let rowByField = 'state';
    let orderByField = 'id';
    let orderDirection = 'asc';
    let searchQuery = '';
    let hideEmptyRows = false;
    let hideNullRows = false;
  
    let filters = [];
  
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
  
    // Function to filter issues based on search query and filters
    function filterIssues(data, query, filters) {
      let filteredData = data;
      if (query) {
        filteredData = filteredData.filter(issue => {
          return Object.values(issue).some(value => 
            value !== null && value.toString().toLowerCase().includes(query.toLowerCase())
          );
        });
      }
  
      filters.forEach(filter => {
        filteredData = filteredData.filter(issue => issue[filter.field] === filter.value);
      });
  
      return filteredData;
    }
  
    function groupAndSortIssues(data, groupBy, orderBy, orderDir) {
      const grouped = data.reduce((acc, issue) => {
        const groupKey = issue[groupBy] || `No ${groupBy}`;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(issue);
        return acc;
      }, {});
  
      // Apply specific order to groups
      const groupOrder = Configs[groupBy]?.map(item => item.name) || [];
      const orderedGroups = Object.keys(grouped).sort((a, b) => {
        const indexA = groupOrder.indexOf(a);
        const indexB = groupOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  
      // Apply specific order to items within each group
      Object.values(grouped).forEach(group => {
        group.sort((a, b) => {
          const sortResult = customSort(a, b, orderBy);
          return orderDir === 'asc' ? sortResult : -sortResult;
        });
      });
  
      let result = orderedGroups.map(key => ({ key, issues: grouped[key] }));
  
      if (hideEmptyRows) {
        result = result.filter(group => group.issues.length > 0);
      }
  
      if (hideNullRows) {
        result = result.filter(group => group.key !== `No ${groupBy}`);
      }
  
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
  
    // Update the grouped issues when the store changes, search query changes, or filters change
    $: {
      const filteredIssues = filterIssues($issuesDataStore, searchQuery, filters);
      groupedIssues = groupAndSortIssues(filteredIssues, rowByField, orderByField, orderDirection);
      filteredIssuesDataStore.set(filteredIssues); // Update the filtered issues store
    }
  
    // Handle display option changes
    function handleRowByChange(event) {
      rowByField = event.detail;
    }
  
    function handleOrderByChange(event) {
      orderByField = event.detail;
    }
  
    function handleOrderDirectionChange(event) {
      orderDirection = event.detail;
    }
  
    function handleHideEmptyRowsChange(event) {
      hideEmptyRows = event.detail;
    }
  
    function handleHideNullRowsChange(event) {
      hideNullRows = event.detail;
    }
  
    // Handle filter changes and update the filtered issues store
    function handleFilterUpdate(event) {
      filters = event.detail.filters;
      searchQuery = event.detail.searchQuery;
      const filteredIssues = filterIssues($issuesDataStore, searchQuery, filters);
      filteredIssuesDataStore.set(filteredIssues);
    }
  </script>

  <style>


    .list-container {
        overflow-y: auto;

    }
  </style>
  
  <FilterControls
    on:filterUpdate={handleFilterUpdate}
  />
  
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
      <h4>{key}</h4>
      <ul>
        {#each issues as issue}
          <IssueItem {issue} />
        {/each}
      </ul>
    {/each}
  </div>
  