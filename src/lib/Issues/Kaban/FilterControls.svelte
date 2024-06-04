<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    const dispatch = createEventDispatcher();
  
    export let rowByField: string;
    export let columnByField: string;
    export let orderByField: string;
    export let orderDirection: string; // Add this line
    export let hideEmptyRows: boolean;
    export let hideEmptyColumns: boolean;
    export let hideNullRows: boolean;
    export let hideNullColumns: boolean;
  
    function handleRowByChange(event) {
      dispatch('rowByChange', event.target.value);
    }
  
    function handleColumnByChange(event) {
      dispatch('columnByChange', event.target.value);
    }
  
    function handleOrderByChange(event) {
      dispatch('orderByChange', event.target.value);
    }
  
    function handleOrderDirectionChange(event) {
      dispatch('orderDirectionChange', event.target.value);
    }
  
    function handleHideEmptyRowsChange(event) {
      dispatch('hideEmptyRowsChange', event.target.checked);
    }
  
    function handleHideEmptyColumnsChange(event) {
      dispatch('hideEmptyColumnsChange', event.target.checked);
    }
  
    function handleHideNullRowsChange(event) {
      dispatch('hideNullRowsChange', event.target.checked);
    }
  
    function handleHideNullColumnsChange(event) {
      dispatch('hideNullColumnsChange', event.target.checked);
    }
  </script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger> Display Options </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <div>
            <label for="row-by">Row By:</label>
            <select id="row-by" on:change={handleRowByChange} bind:value={rowByField}>
              <option value="priority">Priority</option>
              <option value="state">State</option>
              <option value="none">No Row</option>
            </select>
          
            <label for="column-by">Column By:</label>
            <select id="column-by" on:change={handleColumnByChange} bind:value={columnByField}>
              <option value="state">State</option>
              <option value="priority">Priority</option>
            </select>
          
            <label for="order-by">Order By:</label>
            <select id="order-by" on:change={handleOrderByChange} bind:value={orderByField}>
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="priority">Priority</option>
              <option value="state">State</option>
            </select>
          
            <label for="order-direction">Order Direction:</label>
            <select id="order-direction" on:change={handleOrderDirectionChange} bind:value={orderDirection}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          
            <div>
              <label>
                <input type="checkbox" on:change={handleHideEmptyRowsChange} bind:checked={hideEmptyRows} />
                Hide Empty Rows
              </label>
            </div>
          
            <div>
              <label>
                <input type="checkbox" on:change={handleHideEmptyColumnsChange} bind:checked={hideEmptyColumns} />
                Hide Empty Columns
              </label>
            </div>
          
            <div>
              <label>
                <input type="checkbox" on:change={handleHideNullRowsChange} bind:checked={hideNullRows} />
                Hide Null Rows
              </label>
            </div>
          
            <div>
              <label>
                <input type="checkbox" on:change={handleHideNullColumnsChange} bind:checked={hideNullColumns} />
                Hide Null Columns
              </label>
            </div>
          </div>
          
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  
 