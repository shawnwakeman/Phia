<script lang="ts">

    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { filterStoreTM } from "../../stores";
    import {SlidersHorizontal } from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button/index.js";
   
  function handleRowByChange(event) {
    filterStoreTM.update(filters => ({ ...filters, rowByField: event.target.value }));
  }

  function handleOrderByChange(event) {
    filterStoreTM.update(filters => ({ ...filters, orderByField: event.target.value }));
  }

  function handleOrderDirectionChange(event) {
    filterStoreTM.update(filters => ({ ...filters, orderDirection: event.target.value }));
  }

  function handleHideEmptyRowsChange(event) {
    filterStoreTM.update(filters => ({ ...filters, hideEmptyRows: event.target.checked }));
  }

  function handleHideNullRowsChange(event) {
    filterStoreTM.update(filters => ({ ...filters, hideNullRows: event.target.checked }));
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
      <label for="row-by">Group By:</label>
      <select id="row-by" on:change={handleRowByChange}>
        <option value="priority">Priority</option>
        <option value="state">State</option>
        <option value="none">No Group</option>
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
          Hide Empty Groups
        </label>
      </div>
    
      <div>
        <label>
          <input type="checkbox" on:change={handleHideNullRowsChange} />
          Hide Null Groups
        </label>
      </div>
    </div>
  </DropdownMenu.Content>
</DropdownMenu.Root>