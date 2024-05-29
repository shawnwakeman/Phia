<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { issuesDataStore, addedIssue } from "../../../stores";
    import { get, writable } from 'svelte/store';
    import Board from './Board.svelte';
    import type { Issue } from "../../../types/collection";
    import { pan } from 'svelte-gestures';
    import {isDragging} from '../../../stores'


    interface BoardColumn {
      id: number;
      name: string;
      items: Issue[];
    }
  
    interface BoardRow {
      id: number;
      name: string;
      columns: BoardColumn[];
    }
  
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
  
    let rows: BoardRow[] = [];
    let board: BoardRow[] = [];
    let names: BoardColumn[] = []
    let rowByField = 'priority';
    let columnByField = 'state';

    let searchQuery = '';
    let filters: { field: string; value: string }[] = [];
    let orderByField = 'id';

    const filterFields = [
        { label: 'State', value: 'state' },
        { label: 'Priority', value: 'priority' },
        { label: 'Cycle', value: 'cycle' },
        { label: 'Assignee', value: 'assignee' }
    ];


    function filterIssues(data: Issue[], query: string, filters: { field: string; value: string }[]): Issue[] {
    let filteredData = data;

    if (query) {
      filteredData = filteredData.filter(issue =>
        Object.values(issue).some(value => value !== null && value.toString().toLowerCase().includes(query.toLowerCase()))
      );
    }

    filters.forEach(filter => {
      filteredData = filteredData.filter(issue => issue[filter.field] === filter.value);
    });

    return filteredData;
  }
  
    function updateBoard() {
        let issues: Issue[] = get(issuesDataStore);
        issues = filterIssues(issues, searchQuery, filters);

        const configRows = rowByField !== 'none' ? Configs[rowByField] : null;
        const configColumns = Configs[columnByField];
    
      if (configColumns) {
        if (configRows) {
          rows = configRows.map((rowConfig, rowIndex) => ({
            id: rowIndex,
            name: rowConfig.name,
            columns: configColumns.map((colConfig, colIndex) => ({
              id: colIndex,
              name: colConfig.name,
              items: []
            }))
          }));
        } else {
          rows = [{
            id: 0,
            name: '',
            columns: configColumns.map((colConfig, colIndex) => ({
              id: colIndex,
              name: colConfig.name,
              items: []
            }))
          }];
        }
        board = transformIssuesToBoard(issues);
      } else {
        console.warn(`No configuration found for field: ${columnByField}`);
      }
    }
  
    function transformIssuesToBoard(issues: Issue[]): BoardRow[] {
      let board: BoardRow[] = rows.map(row => ({
        id: row.id,
        name: row.name,
        columns: row.columns.map(column => ({
          id: column.id,
          name: column.name,
          items: []
        }))
      }));
  
      issues.forEach(issue => {
        if (rowByField !== 'none') {
          const row = board.find(r => r.name === issue[rowByField]);
          if (row) {
            const column = row.columns.find(col => col.name === issue[columnByField]);
            if (column) {
              column.items.push(issue);
            } else {
              console.warn(`No column found for ${columnByField}: ${issue[columnByField]}`, issue);
            }
          } else {
            console.warn(`No row found for ${rowByField}: ${issue[rowByField]}`, issue);
          }
        } else {
          const column = board[0].columns.find(col => col.name === issue[columnByField]);
          if (column) {
            column.items.push(issue);
          } else {
            console.warn(`No column found for ${columnByField}: ${issue[columnByField]}`, issue);
          }
        }
      });

        board.forEach(row => {
        row.columns.forEach(column => {
            column.items.sort((a, b) => {
            if (a[orderByField] < b[orderByField]) return -1;
            if (a[orderByField] > b[orderByField]) return 1;
            return 0;
            });
        });
        });
  
      return board;
    }

  

  

  
    $: if ($addedIssue) {
      updateBoard();
      addedIssue.set(false);
    }
  
    function handleColumnByChange(event) {
      columnByField = event.target.value;
      updateBoard();
    }
  
    function handleRowByChange(event) {
      rowByField = event.target.value;
      updateBoard();
    }

    function handleSearchQueryChange(event) {
        searchQuery = event.target.value;
        updateBoard();
    }

    function handleOrderByChange(event) {
        orderByField = event.target.value;
        updateBoard();
    }

    function addFilter() {
    const selectedFilterField = filterFields.find(f => f.value === selectedFilterFieldValue);
    if (selectedFilterField && selectedFilterOption) {
      filters = [...filters, { field: selectedFilterField.value, value: selectedFilterOption }];
      selectedFilterFieldValue = '';
      selectedFilterOption = '';
      updateBoard();
    }
  }

    function removeFilter(index) {
        filters = filters.filter((_, i) => i !== index);
        updateBoard();
    }

    let selectedFilterFieldValue = '';
    let selectedFilterOption = '';
    let filterOptions = [];

    function handleFilterFieldChange(event) {
        selectedFilterFieldValue = event.target.value;
        updateFilterOptions(selectedFilterFieldValue);
    }

    function handleFilterOptionChange(event) {
        selectedFilterOption = event.target.value;
    }

    function updateFilterOptions(field) {
        const issues = get(issuesDataStore);
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

    
    let boardContainer;
    let columnTitlesContainer; // Binding for the column titles container
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;


    const autoScrollThreshold = 50; // pixels from the edge to trigger scrolling
    const autoScrollSpeed = 20; // pixels to scroll per frame
    let autoScrollInterval;

    $: if ($isDragging) {
        startAutoScroll();
    } else {
        stopAutoScroll();
    }

    let mouseX = 0;
    let mouseY = 0;

    // Update mouse position on mousemove
    if (typeof window !== 'undefined') {
        window.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
    }


    function handleMouseDown(event) {
        if ($isDragging) return; // Prevent panning while dragging
        isPanning = true;
        startX = event.pageX - boardContainer.offsetLeft;
        startY = event.pageY - boardContainer.offsetTop;
        scrollLeft = boardContainer.scrollLeft;
        scrollTop = boardContainer.scrollTop;
        boardContainer.style.cursor = 'grabbing';
        columnTitlesContainer.style.cursor = 'grabbing';
    }

    function handleMouseUp() {
        
        isPanning = false;
        boardContainer.style.cursor = 'grab';
        columnTitlesContainer.style.cursor = 'grab'; // Reset cursor style
    }

    function handleMouseMove(event) {
       
        if ($isDragging) return; // Prevent handling mouse move while dragging
        if (!isPanning) return;
        event.preventDefault();
        requestAnimationFrame(() => {
            const x = event.pageX - boardContainer.offsetLeft;
            const y = event.pageY - boardContainer.offsetTop;
            const walkX = (x - startX);
            const walkY = (y - startY);
            boardContainer.scrollLeft = scrollLeft - walkX;
            columnTitlesContainer.scrollLeft = boardContainer.scrollLeft; // Sync scroll position
            boardContainer.scrollTop = scrollTop - walkY;
        });
        
    }


    function handleAutoScroll() {
       
        const rect = boardContainer.getBoundingClientRect();

        let scrollX = 0;
        let scrollY = 0;

        if (mouseX < rect.left + autoScrollThreshold) {
            scrollX = -autoScrollSpeed;
        } else if (mouseX > rect.right - autoScrollThreshold) {
            scrollX = autoScrollSpeed;
        }
        if (mouseY < rect.top + autoScrollThreshold) {
            scrollY = -autoScrollSpeed;
        } else if (mouseY > rect.bottom - autoScrollThreshold) {
            scrollY = autoScrollSpeed;
        }

        if (scrollX !== 0 || scrollY !== 0) {
            boardContainer.scrollLeft += scrollX;
            boardContainer.scrollTop += scrollY;
            columnTitlesContainer.scrollLeft = boardContainer.scrollLeft; // Sync scroll position
            console.log(`Auto-scrolling applied: scrollX=${scrollX}, scrollY=${scrollY}`);
        } else {
            console.log("No auto-scrolling applied");
        }
    }

    function startAutoScroll() {
        if (autoScrollInterval) return;
        autoScrollInterval = setInterval(handleAutoScroll, 16); // Approximately 60 FPS
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    function handleScroll(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log("Scroll event detected");
    if ($isDragging) {
      console.log("Dragging is active");
      // Handle the scroll event when dragging is active
      columnTitlesContainer.scrollLeft = boardContainer.scrollLeft; // Sync scroll position
    }
  }



    $: if ($isDragging) {
        startAutoScroll();
    } else {
        stopAutoScroll();
    }


    onMount(() => {
        updateBoard();
        names = board[0].columns;
        boardContainer.addEventListener('scroll', handleScroll); // Add scroll event listener

        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', (event) => {
                mouseX = event.clientX;
                mouseY = event.clientY;
            });
            console.log("sad");
            
            
            return () => {
                window.removeEventListener('mousemove', (event) => {
                    mouseX = event.clientX;
                    mouseY = event.clientY;
                });

                boardContainer.removeEventListener('scroll', handleScroll); 
            };
        }
    });




    
</script>
  
<style>
    :global(*) {
      box-sizing: border-box;
      margin: 0;
    }
    .board-container {
   
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%;
        height: 100%;
        cursor: grab; /* Indicates the draggable area */
        border: 1px solid #333333;
    }
    .board-container.grabbing {
        cursor: grabbing; /* Indicates dragging */
    }
    .column-titles {
        display: flex;
        justify-content: space-around;
        margin-bottom: 1em;
        padding: 1em;
    }
    .column-title {
        min-width: 400px;
        width: 400px;
    }
</style>
  
<div>
    <label for="row-by">Row By:</label>
    <select id="row-by" on:change={handleRowByChange}>
      <option value="priority">Priority</option>
      <option value="state">State</option>
      <option value="none">No Row</option>
    </select>
  
    <label for="column-by">Column By:</label>
    <select id="column-by" on:change={handleColumnByChange}>
      <option value="state">State</option>
      <option value="priority">Priority</option>
    </select>
  
    <label for="order-by">Order By:</label>
    <select id="order-by" on:change={handleOrderByChange}>
      <option value="id">ID</option>
      <option value="name">Name</option>
      <option value="priority">Priority</option>
      <option value="state">State</option>
      <!-- Add other fields as necessary -->
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
  
    {#if selectedFilterFieldValue}
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
  
  <div bind:this={columnTitlesContainer} class="column-titles">
    {#each names as column}
        <div class="column-title">{column.name}</div>
    {/each}
</div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div bind:this={boardContainer} class="board-container" 
  on:mousedown={handleMouseDown} 
  on:mouseup={handleMouseUp} 
  on:mouseleave={handleMouseUp} 
  on:mousemove={handleMouseMove}>

  {#each board as row (row.id)}
      {#if rowByField !== 'none'}
          <h1>{row.name}</h1>
      {/if}
      <Board columnItems={row.columns} rowName={row.name} rowByField={rowByField} columnByField={columnByField} orderBy={orderByField} />
  {/each}
</div>