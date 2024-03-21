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

    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { cn } from "$lib/utils.js";
    
    
    
    type Payment = {
      id: string;
      amount: number;
      status: "pending" | "processing" | "success" | "failed";
      email: string;
    };

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
        console.log(`Row with ID ${rowId} was deactivated.`);
    } else {
        // Set the clicked row as active
        activeRowId.set(rowId);
        console.log(`Row with ID ${rowId} was clicked and activated.`);
    }

    // Example navigation logic could be placed here, adjusted based on the new activeRowId state
}
   
    const data: Payment[] = [
      {
        id: "m5gr84i9",
        amount: 316,
        status: "success",
        email: "ken99@yahoo.com",
      },
      {
        id: "asdads2",
        amount: 3156,
        status: "success",
        email: "dadd99@yahoo.com",
      },
      {
        id: "m5gras84i9",
        amount: 312416,
        status: "success",
        email: "sdaasdasdas@yahoo.com",
      },


     
      //...
    ];

        const initialPageIndex = 0; // Start from the first page
        const initialPageSize = 50; // Set page size to 50 as required
        const serverSide = true; // Assuming you want server-side pagination
        const serverItemCount = 1000; // This should be the total count of items from the server, adjust as necessary

 
        


   
	const table = createTable(writable(data), {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination({ initialPageSize: 50}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue),
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns(),
	});
   
    const columns = table.createColumns([
    table.column({
        accessor: "id",
      header: "ID",
      plugins: {
        sort: {
          disable: true,
        },
        filter: {
          exclude: true,
        },
      },
    }),
    table.column({
      accessor: "status",
      header: "Status",
      plugins: {
        filter: {
          exclude: true,
        },
      },
    }),
    table.column({
      accessor: "email",
      header: "Email",
    }),
    table.column({
      accessor: "amount",
      header: "Amount",
      cell: ({ value }) => {
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
        return formatted;
      },
      plugins: {
        filter: {
          exclude: true,
        },
      },
    }),
    table.column({
      accessor: ({ id }) => id,
      header: "",
      cell: ({ value }) => {
        return createRender(DataTableActions, { id: value });
      },
      plugins: {
        sort: {
          disable: true,
        },
      },
    }),
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
 
    const hidableCols = ["status", "email", "amount"];
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
										{:else if cell.id === "email"}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />

											</Button>
										{:else}
											<Render of={cell.render()} />
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
                                    {#if cell.id === "amount"}
                                        <div 
                                            on:click={() => handleRowClick(row.id)}
                                            class="cursor-pointer { $activeRowId === row.id ? 'bg-blue-100' : '' }"
                                            >
                                                <Render of={cell.render()} />
                                        </div>
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

 