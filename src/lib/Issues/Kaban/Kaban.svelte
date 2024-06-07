<script lang="ts">
  import { onMount, onDestroy  } from 'svelte';
  import { issuesDataStore, addedIssue, filteredIssuesDataStore } from "../../../stores";

  import { addIssue } from '$lib/supabaseClient';
  import { get } from 'svelte/store';
  import Board from './Board.svelte';
  import type { Issue } from "../../../types/collection";
  import SearchAndFilter from './Filter.svelte';
  import FilterControls from './FilterControls.svelte'; // Import the new component
  import { isDragging } from '../../../stores';
  import { Button } from "$lib/components/ui/button";
  import * as Collapsible from "$lib/components/ui/collapsible";
    import AddButton from './AddButton.svelte';
  
 
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



  let issues = get(issuesDataStore);
  let filteredIssues = issues;

  let childRef;

    function callUpdateBoard() {
        if (childRef && childRef.updateBoard) {
            childRef.updateBoard();
        }
    }

  let rows: BoardRow[] = [];
  let board: BoardRow[] = [];
  let names: BoardColumn[] = [];
  let rowByField = 'priority';
  let columnByField = 'state';
  let orderByField = 'id';
  let orderDirection = 'asc'; 
  let hideEmptyRows = false;
  let hideEmptyColumns = false;
  let hideNullRows = false;
  let hideNullColumns = false;

  let notFirstLoad = false
  const unsubscribe = filteredIssuesDataStore.subscribe(value => {
        if(notFirstLoad) {
            filteredIssues = value;
            updateBoard()
        }
        notFirstLoad = true
    });


    function updateBoard() {
        console.trace("asd");
        
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
          })),
          no: rowIndex,
          rowBy: rowConfig.name,
        }));
      } else {
        rows = [{
          id: 0,
          name: '',
          columns: configColumns.map((colConfig, colIndex) => ({
            id: colIndex,
            name: colConfig.name,
            items: [],
            no: colIndex,
            columnBy: colConfig.name,
          }))
        }];
      }
      board = transformIssuesToBoard(filteredIssues);
    } else {
      console.warn(`No configuration found for field: ${columnByField}`);
    }

    applyHideEmptyRowsAndColumns();
    names = board[0].columns;
  }

  function applyHideEmptyRowsAndColumns() {
    if (hideEmptyRows) {
      board = board.filter(row => row.columns.some(col => col.items.length > 0));
    }

    if (hideEmptyColumns) {
      let columnsToKeep = new Set<string>();

      board.forEach(row => {
        row.columns.forEach(column => {
          if (column.items.length > 0) {
            columnsToKeep.add(column.name);
          }
        });
      });

      board.forEach(row => {
        row.columns = row.columns.filter(col => columnsToKeep.has(col.name));
      });
    }

    if (hideNullRows) {
      board = board.filter(row => row.name !== `no ${rowByField}`);
    }

    if (hideNullColumns) {
      board.forEach(row => {
        row.columns = row.columns.filter(col => col.name !== `no ${columnByField}`);
      });
    }
  }





  function transformIssuesToBoard(issues: Issue[]): BoardRow[] {
  let board: BoardRow[];

  if (rowByField === 'none') {
    board = [
      {
        id: 0,
        name: 'All Issues',
        columns: Configs[columnByField].map((colConfig, colIndex) => ({
          id: colIndex,
          name: colConfig.name,
          items: [],
          no: colIndex,
          columnBy: colConfig.name,
        })),
        no: 0,
        rowBy: 'All Issues',
      }
    ];
  } else {
    board = rows.map(row => ({
      id: row.id,
      name: row.name,
      columns: row.columns.map(column => ({
        id: column.id,
        name: column.name,
        items: [],
        no: column.id,
        columnBy: column.name,
      })),
      no: row.id,
      rowBy: row.name,
    }));
  }

  issues.forEach(issue => {
    let row = rowByField === 'none' ? board[0] : board.find(r => r.name === issue[rowByField]);
    if (!row) {
      row = {
        id: board.length,
        name: `no ${rowByField}`,
        columns: Configs[columnByField].map((colConfig, colIndex) => ({
          id: colIndex,
          name: colConfig.name,
          items: [],
          no: colIndex,
          columnBy: colConfig.name,
        })),
        no: board.length,
        rowBy: `no ${rowByField}`,
      };
      board.push(row);
    }

    let column = row.columns.find(col => col.name === issue[columnByField]);
    if (!column) {
      column = row.columns.find(col => col.name === `no ${columnByField}`);
      if (!column) {
        column = {
          id: row.columns.length,
          name: `no ${columnByField}`,
          items: [],
          no: row.columns.length,
          columnBy: `no ${columnByField}`,
        };
        row.columns.push(column);
      }
      issue[columnByField] = null;
    }
    column.items.push(issue);
  });

  // Ensure null columns are added to all rows
  board.forEach(row => {
    if (!row.columns.find(col => col.name === `no ${columnByField}`)) {
      row.columns.push({
        id: row.columns.length,
        name: `no ${columnByField}`,
        items: [],
        no: row.columns.length,
        columnBy: `no ${columnByField}`,
      });
    }
  });

  // Ensure null row is added with null columns
  if (rowByField !== 'none' && !board.find(row => row.name === `no ${rowByField}`)) {
    const nullRowColumns = Configs[columnByField].map((colConfig, colIndex) => ({
      id: colIndex,
      name: colConfig.name,
      items: [],
      no: colIndex,
      columnBy: colConfig.name,
    }));

    if (!nullRowColumns.find(col => col.name === `no ${columnByField}`)) {
      nullRowColumns.push({
        id: nullRowColumns.length,
        name: `no ${columnByField}`,
        items: [],
        no: nullRowColumns.length,
        columnBy: `no ${columnByField}`,
      });
    }

    board.push({
      id: board.length,
      name: `no ${rowByField}`,
      columns: nullRowColumns,
      no: board.length,
      rowBy: `no ${rowByField}`,
    });
  }

  board.forEach(row => {
      row.columns.forEach(column => {
        column.items.sort((a, b) => {
          const sortResult = customSort(a, b, orderByField);
          return orderDirection === 'asc' ? sortResult : -sortResult;
        });
      });
    });

  return board;
}
function customSort(a, b, field) {
  if (a[field] === null || a[field] === undefined) return 1;
  if (b[field] === null || b[field] === undefined) return -1;

  if (field === 'id') {
    return a.id - b.id;
  } else if (field === 'name') {
    return a.name.localeCompare(b.name);
  } else if (field === 'priority') {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  } else if (field === 'state') {
    const stateOrder = { 'Open': 0, 'DOING': 1, 'DONE': 2 };
    return stateOrder[a.state] - stateOrder[b.state];
  }
  return 0;
}



  $: if ($addedIssue) {
    updateBoard();
    addedIssue.set(false);
  }

  function addIssueMain() {
        addIssue(2);
        callUpdateBoard();
        updateBoard();
    }


  function handleRowByChange(event) {
    callUpdateBoard()
    rowByField = event.detail;
    updateBoard();
  }

  function handleColumnByChange(event) {
    callUpdateBoard()
    columnByField = event.detail;
    updateBoard();
  }

  function handleOrderByChange(event) {
    callUpdateBoard()
    orderByField = event.detail;
    updateBoard();
  }

  function handleHideEmptyRowsChange(event) {
    callUpdateBoard()
    hideEmptyRows = event.detail;
    updateBoard();
  }

  function handleHideEmptyColumnsChange(event) {
    callUpdateBoard()
    hideEmptyColumns = event.detail;
    updateBoard();
  }

  function handleHideNullRowsChange(event) { // Add this function
    callUpdateBoard();
    hideNullRows = event.detail;
    updateBoard();
  }

  function handleHideNullColumnsChange(event) { // Add this function
    callUpdateBoard();
    hideNullColumns = event.detail;
    updateBoard();
  }

  function handleOrderDirectionChange(event) {
    callUpdateBoard();
    orderDirection = event.detail;
    updateBoard();
  }


  let boardContainer;
  let columnTitlesContainer;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;

  const autoScrollThreshold = 50;
  const autoScrollSpeed = 20;
  let autoScrollInterval;

  $: if ($isDragging) {
    startAutoScroll();
  } else {
    stopAutoScroll();
  }

  let mouseX = 0;
  let mouseY = 0;

  function handleGlobalMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }


  function handleMouseDown(event) {
    if ($isDragging) return;
    isPanning = true;
    startX = event.pageX - boardContainer.offsetLeft;
    startY = event.pageY - boardContainer.offsetTop;
    scrollLeft = boardContainer.scrollLeft;
    scrollTop = boardContainer.scrollTop;
    boardContainer.style.cursor = 'grabbing';
    columnTitlesContainer.style.cursor = 'grabbing';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    console.log('Mouse down event:', { startX, startY, scrollLeft, scrollTop });
  }

  function handleMouseUp() {
    isPanning = false;
    boardContainer.style.cursor = 'grab';
  
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mouseleave', handleMouseLeave);
    console.log('Mouse up event');
  }

  function handleMouseLeave() {
    if (isPanning) {
      isPanning = false;
      boardContainer.style.cursor = 'grab';
      columnTitlesContainer.style.cursor = 'grab';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      console.log('Mouse leave event');
    }
  }


  function handleMouseMove(event) {
  if ($isDragging) return;
  if (!isPanning) return;
  event.preventDefault();
  requestAnimationFrame(() => {
    const x = event.pageX - boardContainer.getBoundingClientRect().left;
    const y = event.pageY - boardContainer.getBoundingClientRect().top;
    let walkX = (x - startX);
    let walkY = (y - startY);

    // Adjust scroll positions
    let newScrollLeft = scrollLeft - walkX;
    let newScrollTop = scrollTop - walkY;

    // Constrain the scroll values within the limits
    newScrollLeft = Math.max(0, Math.min(boardContainer.scrollWidth - boardContainer.clientWidth, newScrollLeft));
    newScrollTop = Math.max(0, Math.min(boardContainer.scrollHeight - boardContainer.clientHeight, newScrollTop));

    // If the scroll position hits the limit, reset start positions to avoid dead dragging
    if (newScrollLeft === 0 || newScrollLeft === boardContainer.scrollWidth - boardContainer.clientWidth) {
      startX = x;
      scrollLeft = newScrollLeft;
    }

    if (newScrollTop === 0 || newScrollTop === boardContainer.scrollHeight - boardContainer.clientHeight) {
      startY = y;
      scrollTop = newScrollTop;
    }

    boardContainer.scrollLeft = newScrollLeft;
    boardContainer.scrollTop = newScrollTop;
    columnTitlesContainer.scrollLeft = boardContainer.scrollLeft;

    console.log('Mouse move event:', { x, y, walkX, walkY, scrollLeft: boardContainer.scrollLeft, scrollTop: boardContainer.scrollTop });
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
    } else if (mouseY > rect.bottom + autoScrollThreshold) {
      scrollY = autoScrollSpeed;
    }

    if (scrollX !== 0 || scrollY !== 0) {
      boardContainer.scrollLeft += scrollX;
      boardContainer.scrollTop += scrollY;
      columnTitlesContainer.scrollLeft = boardContainer.scrollLeft;
      console.log(`Auto-scrolling applied: scrollX=${scrollX}, scrollY=${scrollY}`);
    } else {
      console.log("No auto-scrolling applied");
    }
  }

  function startAutoScroll() {
    if (autoScrollInterval) return;
    autoScrollInterval = setInterval(handleAutoScroll, 16);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }



  $: if ($isDragging) {
    startAutoScroll();
  } else {
    stopAutoScroll();
  }

  function syncScroll() {
  columnTitlesContainer.scrollLeft = boardContainer.scrollLeft;
    }

    let resizeObserver;
    function adjustRowContainerWidth() {
    const boardWidth = boardContainer.scrollWidth;
    document.querySelectorAll('.row-container').forEach(container => {
      container.style.width = `${boardWidth}px`;
    });
  }

  onMount(() => {
    updateBoard();

    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        adjustRowContainerWidth();
      }
    });

    resizeObserver.observe(boardContainer);
 

    boardContainer.addEventListener('mousedown', handleMouseDown);
    boardContainer.addEventListener('scroll', syncScroll);
    window.addEventListener('mousemove', handleGlobalMouseMove);



    return () => {
        boardContainer.removeEventListener('mousedown', handleMouseDown);
        boardContainer.removeEventListener('scroll', syncScroll);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('resize', adjustRowContainerWidth);
    };
  });

  onDestroy(() => {
        unsubscribe();
    });


    function applyHideEmptyRowsAndColumns2() {
        if (hideEmptyRows) {
            board = board.filter(row => row.columns.some(col => col.items.length > 0));
        }

        if (hideEmptyColumns) {
            let columnsToKeep = new Set<string>();

            board.forEach(row => {
                row.columns.forEach(column => {
                    if (column.items.length > 0) {
                        columnsToKeep.add(column.name);
                    }
                });
            });

            board.forEach(row => {
                row.columns = row.columns.filter(col => columnsToKeep.has(col.name));
            });
        }

        // Trigger reactivity by updating the board array
        board = [...board];
    }

   
</script>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;

  }

  .main-container {
    user-select: none;  /* user */
   
  }
  .board-container {
    overflow-y: auto;
    overflow-x: auto;
    width: 100%;
    height: 100%;
    cursor: grab;
    border: 1px solid #333333;
    user-select: none;  /* user */
    
  }
  .board-container.grabbing {
    cursor: grabbing;
  }
  .column-titles-container {
  overflow-x: hidden; /* Allow horizontal scrolling */
  overflow-y: hidden; /* Prevent vertical scrolling */
  white-space: nowrap; /* Prevent line breaks */
  user-select: none;  /* user */
}

    .column-titles {
        display: inline-flex; /* Change to inline-flex to allow horizontal scrolling */
        justify-content: flex-start;
        margin-bottom: 2em;
        padding: 2.05em;
        position: sticky;
        top: 0;
        z-index: 10;
        border-radius: 8px; /* Rounded corners for the column titles */
    }


  .column-title {

    width: 370px;
    padding: 1em; /* Increased padding inside each column title */
    border-radius: 8px; /* Rounded corners for each column title */
    background-color: #ffffff; /* Background color for each column title */
    margin-right: 2em; /* Increased margin between column titles */
    display: flex; /* Use flexbox for centering content */
    align-items: center; /* Vertically center content */
    justify-content: center; /* Horizontally center content */
    text-align: center; /* Center text */
    border: 1px solid #cccccc; /* Add a border to the column titles */
  }
  
      .row-title {
    position: sticky;
    left: 0;
    background-color: #ffffff; /* Match the background color with the column titles */
    z-index: 9; /* Ensure it stays behind the column titles but above the board */
    padding: 1em;
    border-right: 1px solid #cccccc; /* Add a right border to separate from the board */
  }
  .row-container {
    display: flex;
    align-items: center;
    padding: 1em;
    background-color: #ffffff;
    border-bottom: 1px solid #cccccc;
    position: sticky; /* Make the whole container sticky */
    top: 0; /* Set the top position to 0 so it sticks to the top of the viewport */
    z-index: 10; /* Higher z-index to ensure it's above other content */
    width: 100%; /* Ensure the row container stretches with content */
    min-width: 100%; /* Ensure the row container stretches with content */
}
  .row-content {
    flex: 1;
    display: flex;
    min-width: 100%; /* Ensure the content stretches the full width */
  }

  .toggle-button {
    margin-right: 1em;
  }

</style>

<div class="main-container" >

    <!-- <button on:click={() => addIssueMain()}>add is broken</button>  -->


    <FilterControls
    bind:rowByField={rowByField}
    bind:columnByField={columnByField}
    bind:orderByField={orderByField}
    bind:orderDirection={orderDirection}
    bind:hideEmptyRows={hideEmptyRows}
    bind:hideEmptyColumns={hideEmptyColumns}
    bind:hideNullRows={hideNullRows}
    bind:hideNullColumns={hideNullColumns}
    on:rowByChange={handleRowByChange}
    on:columnByChange={handleColumnByChange}
    on:orderByChange={handleOrderByChange}
    on:orderDirectionChange={handleOrderDirectionChange} 
    on:hideEmptyRowsChange={handleHideEmptyRowsChange}
    on:hideEmptyColumnsChange={handleHideEmptyColumnsChange}
    on:hideNullRowsChange={handleHideNullRowsChange}
    on:hideNullColumnsChange={handleHideNullColumnsChange}
  />

    <AddButton addIssueMain={addIssueMain}/>

  <SearchAndFilter bind:this={childRef} />
  <!--  -->
</div >


<div class="column-titles-container" bind:this={columnTitlesContainer}>
    <div class="column-titles">
        {#each names as column}
            <div class="column-title">
                <AddButton addIssueMain={addIssueMain}/>
                {column.name}
            </div>
      
        {/each}
    </div>
  </div>


  <div bind:this={boardContainer} class="board-container" 
  on:mousedown={handleMouseDown} 
  on:mouseup={handleMouseUp} 
  on:mouseleave={handleMouseLeave} 
  on:mousemove={handleMouseMove}>

  {#each board as row (row.id)}
    <Collapsible.Root open={true}>
      <div class="row-container">
        <Collapsible.Trigger asChild let:builder>
          <Button builders={[builder]} variant="ghost" size="sm" class="toggle-button">
            Toggle
            <span class="sr-only">Toggle</span>
          </Button>
        </Collapsible.Trigger>
        <div class="row-title">{#if rowByField !== 'none'}{row.name}{/if}</div>
      </div>
      <Collapsible.Content>
        <Board
          items={row.columns}
          rowName={row.name}
          rowByField={rowByField}
          columnByField={columnByField}
          orderBy={orderByField}
          applyHideEmptyRowsAndColumns={applyHideEmptyRowsAndColumns2}
          board={board}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  {/each}
</div>