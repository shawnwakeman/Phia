<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { issuesDataStore } from '../../../stores';
    import IssueItem from './IssueItem.svelte';
    import Group from './Group.svelte';
    let groupedIssues = [];
    let groupByField = 'state'; // Default grouping field
    let orderByField = 'id'; // Default ordering field
    let searchQuery = ''; // Search query
  // Function to group and sort the issues
  

  let filters = []; // List of active filters
  let selectedFilterField = ''; // Currently selected field for filtering
  let filterOptions = []; // Options for the selected filter field
  let selectedFilterOption = ''; // Selected filter option

  const filterFields = [
    { label: 'State', value: 'state' },
    { label: 'Priority', value: 'priority' },
    { label: 'Cycle', value: 'cycle' },
    { label: 'Assignee', value: 'assignee' }
  ];


  function groupAndSortIssues(data, groupBy, orderBy) {
    const grouped = data.reduce((acc, issue) => {
      const groupKey = issue[groupBy] || 'No ' + groupByField;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(issue);
      return acc;
    }, {});

    for (let key in grouped) {
      grouped[key].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return -1;
        if (a[orderBy] > b[orderBy]) return 1;
        return 0;
      });
    }

    return Object.entries(grouped).map(([key, issues]) => ({ key, issues }));
  }
  // Function to filter issues based on search query
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

  // Function to update filter options when a filter field is selected
  function updateFilterOptions(field) {
    const issues = $issuesDataStore;
    const optionsCount = issues.reduce((acc, issue) => {
      const value = issue[field];
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
    filterOptions = Object.entries(optionsCount).map(([option, count]) => ({
      label: `${option} (${count})`,
      value: option
    }));
  }

  // Update the grouped issues when the store changes, search query changes, or filters change
  $: {
    const filteredIssues = filterIssues($issuesDataStore, searchQuery, filters);
    groupedIssues = groupAndSortIssues(filteredIssues, groupByField, orderByField);
  }

  // Handle group by field change
  function handleGroupByChange(event) {
    groupByField = event.target.value;
  }

  // Handle order by field change
  function handleOrderByChange(event) {
    orderByField = event.target.value;
  }

  // Handle search query change
  function handleSearchQueryChange(event) {
    searchQuery = event.target.value;
  }

  // Handle filter field change
  function handleFilterFieldChange(event) {
    selectedFilterField = event.target.value;
    updateFilterOptions(selectedFilterField);
  }

  // Handle filter option change
  function handleFilterOptionChange(event) {
    console.log(filterOptions);
    selectedFilterOption = event.target.value;
  }

  // Add a new filter
  function addFilter() {
    if (selectedFilterField && selectedFilterOption) {
      filters = [...filters, { field: selectedFilterField, value: selectedFilterOption }];
      selectedFilterField = '';
      selectedFilterOption = '';
      filterOptions = [];
    }
  }

  // Remove a filter
  function removeFilter(index) {
    filters = filters.filter((_, i) => i !== index);
  }
</script>

<style>
    /* Add your styles here */
  </style>


<div>
    <label for="group-by">Group By:</label>
    <select id="group-by" on:change={handleGroupByChange}>
      <option value="created_at">Created At</option>
      <option value="customColumns">Custom Columns</option>
      <option value="description">Description</option>
      <option value="id">ID</option>
      <option value="name">Name</option>
      <option value="node_id">Node ID</option>
      <option value="priority">Priority</option>
      <option value="project_id">Project ID</option>
      <option value="state">State</option>
      <option value="cycle">Cycle</option>
      <option value="assignee">Assignee</option>
      <option value="tags">Tags</option>
    </select>
  
    <label for="order-by">Order By:</label>
    <select id="order-by" on:change={handleOrderByChange}>
      <option value="created_at">Created At</option>
      <option value="customColumns">Custom Columns</option>
      <option value="description">Description</option>
      <option value="id">ID</option>
      <option value="name">Name</option>
      <option value="node_id">Node ID</option>
      <option value="priority">Priority</option>
      <option value="project_id">Project ID</option>
      <option value="state">State</option>
      <option value="cycle">Cycle</option>
      <option value="assignee">Assignee</option>
      <option value="tags">Tags</option>
    </select>
  
    <label for="search">Search:</label>
    <input type="text" id="search" placeholder="Search..." on:input={handleSearchQueryChange} bind:value={searchQuery}>
  
    <label for="filter-field">Filter By:</label>
    <select id="filter-field" on:change={handleFilterFieldChange}>
      <option value="">Select Field</option>
      {#each filterFields as field}
        <option value={field.value}>{field.label}</option>
      {/each}
    </select>
  
    {#if selectedFilterField}
      <label for="filter-option">Options:</label>
      <select id="filter-option" on:change={handleFilterOptionChange}>
        <option value="">Select Option</option>
        {#each filterOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <button on:click={addFilter}>Add Filter</button>
    {/if}
  </div>
  
  <div>
    <h3>Active Filters:</h3>
    <ul>
      {#each filters as filter, index}
        <li>
          {filterFields.find(f => f.value === filter.field).label} is "{filter.value}"
          <button on:click={() => removeFilter(index)}>Remove</button>
        </li>
      {/each}
    </ul>
  </div>
  
  <div>
    {#each groupedIssues as { key, issues }}
      <h2>{key}</h2>
      <ul>
        {#each issues as issue}
          <li>
            <strong>{issue.name}</strong> - {issue.description}
            <br>
            <em>Cycle:</em> {issue.cycle}, <em>Assignee:</em> {issue.assignee}, <em>Tags:</em> {JSON.stringify(issue.tags)}
          </li>
        {/each}
      </ul>
    {/each}
  </div>