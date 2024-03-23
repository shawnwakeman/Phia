<script lang="ts">
    import {
      createTable,
      Render,
      Subscribe,
      createRender,
      
    } from "svelte-headless-table";
    import { addPagination, addSortBy, addTableFilter, addHiddenColumns, addSelectedRows,} from "svelte-headless-table/plugins";
    import { readable } from "svelte/store";
    import { writable } from 'svelte/store';
    import * as Table from "$lib/components/ui/table";
    import DataTableActions from "./DataTableActions.svelte";
    import DataTableNameBox from "./DataTableNameBox.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { cn } from "$lib/utils.js";
    
    import type { Issue, Node } from "../../../types/collection";
    import { selectedNodeStore, issuesDataStore, nodesDataStore, currentSelectedIssue} from "../../../stores";




    const activeRowId = writable<string>("");

        function handleRowClick(rowId: string) {
    // Initialize currentActiveRowId with an empty string
        let currentActiveRowId: string = "";

        // Immediately subscribe to and unsubscribe from the activeRowId store to get its current value
        const unsubscribe = activeRowId.subscribe(value => {
            currentActiveRowId = value;
        });
        unsubscribe(); // Immediately unsubscribe to avoid memory leaks

        if (currentActiveRowId === rowId) {
            // If the clicked row is already active, remove the active state by setting it to an empty string
            activeRowId.set("");
            currentSelectedIssue.set(null) 
  
            console.log(`Row with ID ${rowId} was deactivated.`);
        } else {
            // Set the clicked row as active
            activeRowId.set(rowId);
            let issueIndex = parseInt(rowId, 10);
            currentSelectedIssue.set($issuesDataStore[issueIndex]) 
            console.log(`Row with ID ${rowId} was clicked and activated.`);
        }

    // Example navigation logic could be placed here, adjusted based on the new activeRowId state
}
   



   
	const table = createTable(issuesDataStore, {
		sort: addSortBy(),
		page: addPagination({ initialPageSize: 50}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue),
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns(),
	});
   
    const columns = table.createColumns([
  // ID column
  table.column({
    accessor: "id",
    header: "ID",

  }),
  // Name column

    table.column({
        accessor: "name",

        header: "Name",
        

    }),
  // Description column
  table.column({
    accessor: "description",
    header: "Description",

  }),
  // Priority column
  table.column({
    accessor: "priority",
    header: "Priority",

  }),
  // State column
  table.column({
    accessor: "state",
    header: "State",

  }),
  // Created At column
  table.column({
    accessor: "created_at",
    header: "Created At",
    cell: ({ value }) => {
      const date = new Date(value);
      return date.toLocaleDateString("en-US");
    },
  }),
  // Column Index column (if you decide it's necessary to display)
  table.column({
    accessor: "columnIndex",
    header: "Column Index",
  }),
  // Custom Columns column - you might need to format or select data to display
  table.column({
    accessor: "customcolumns",
    header: "Custom Columns",
    cell: ({ value }) => JSON.stringify(value), // This is a simple approach; adjust as needed
  }),
  // Node ID column (if relevant for display)
  table.column({
    accessor: "node_id",
    header: "Node ID",
  }),
  table.column({
        accessor: (issue) => issue, // Here, the entire issue object is returned
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { issue: value });
      },
    }),
  // Additional or actions column as per your requirement
  // This can include buttons for editing, deleting, etc., based on your app's functionality
]);
     
 
  const {
    headerRows,
    pageRows,
    tableAttrs,
    tableBodyAttrs,
    pluginStates,
    flatColumns,
    rows,
  } = table.createViewModel(columns);
 
  const { pageIndex, hasNextPage, hasPreviousPage } = pluginStates.page;
  const { filterValue } = pluginStates.filter;
  const { hiddenColumnIds } = pluginStates.hide;
  const { selectedDataIds } = pluginStates.select;
 
  const ids = flatColumns.map((col) => col.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]));
 
  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id);
 
    const hidableCols = ["customcolumns", "email", "amount"];

    
  </script>


<div class="w-full">
	<div class="mb-4 flex items-center gap-4">
		<Input
			class="max-w-sm"
			placeholder="Filter emails..."
			type="text"
			bind:value={$filterValue}
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="ml-auto" builders={[builder]}>
					Columns <h1>gay</h1>
                    
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hidableCols.includes(col.id)}
						<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe
									attrs={cell.attrs()}
									let:attrs
									props={cell.props()}
									let:props
								>
									<Table.Head
										{...attrs}
										class={cn("[&:has([role=checkbox])]:pl-3")}
									>
										{#if cell.id === "amount"}
											<div class="text-right">
												<Render of={cell.render()} />
                                                
											</div>
										{:else if cell.id === "id"}
                                           
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />

											</Button>
                                        
										{:else}
                                            <Button variant="ghost" on:click={props.sort.toggle}>
                                                <Render of={cell.render()} />

                                            </Button>
											
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
                {#each $pageRows as row (row.id)}
                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                   

                    <Table.Row
                        {...rowAttrs}
                        data-state={$selectedDataIds[row.id] && "selected"} 

            
                    >
                        {#each row.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs>
                                <Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
                                    {#if cell.id === "id"}
                                        <div 
                                            on:click={() => handleRowClick(row.id)}
                                            class="cursor-pointer { $activeRowId === row.id ? 'bg-blue-100' : '' }"
                                            >
                                                <Render of={cell.render()} />
                                                
                                        </div>

                                    {:else if cell.id === "name"}
                                        <DataTableNameBox issueID = {row.id}/>
                                    
                                    {:else}
                                            <div
                                            
                                        >
                                        <Render of={cell.render()} />
                                        </div>
                                    {/if}
                                </Table.Cell>
                            </Subscribe>
                        {/each}
                    </Table.Row>
                </Subscribe>
            {/each}
            
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of{" "}
			{$rows.length} row(s) selected.
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Previous</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
		>
	</div>
</div>

 