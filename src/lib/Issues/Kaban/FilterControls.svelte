<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { filterStoreKanBan } from "../../../stores";
    import {SlidersHorizontal } from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button/index.js";


    function handleRowByChange(event) {
        filterStoreKanBan.update(filters => ({ ...filters, rowByField: event.target.value }));
  }

  function handleColumnByChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, columnByField: event.target.value }));
  }

  function handleOrderByChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, orderByField: event.target.value }));
  }

  function handleOrderDirectionChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, orderDirection: event.target.value }));
  }

  function handleHideEmptyRowsChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, hideEmptyRows: event.target.checked }));
  }

  function handleHideEmptyColumnsChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, hideEmptyColumns: event.target.checked }));
  }

  function handleHideNullRowsChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, hideNullRows: event.target.checked }));
  }

  function handleHideNullColumnsChange(event) {
    filterStoreKanBan.update(filters => ({ ...filters, hideNullColumns: event.target.checked }));
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0">
        <SlidersHorizontal  class="w-4 h-4 text-current group-hover:text-highlight-color" />
    </Button>

  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
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
      </select>
    
      <label for="order-direction">Order Direction:</label>
      <select id="order-direction" on:change={handleOrderDirectionChange}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    
      <div>
        <label>
          <input type="checkbox" on:change={handleHideEmptyRowsChange} />
          Hide Empty Rows
        </label>
      </div>
    
      <div>
        <label>
          <input type="checkbox" on:change={handleHideEmptyColumnsChange} />
          Hide Empty Columns
        </label>
      </div>
    
      <div>
        <label>
          <input type="checkbox" on:change={handleHideNullRowsChange} />
          Hide Null Rows
        </label>
      </div>
    
      <div>
        <label>
          <input type="checkbox" on:change={handleHideNullColumnsChange} />
          Hide Null Columns
        </label>
      </div>
    </div>
  </DropdownMenu.Content>
</DropdownMenu.Root>