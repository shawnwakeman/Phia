<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import {
		addedIssue,
		filteredIssuesDataStore,
		filteredIssuesForSnapshot,
		filterStoreKanBan,
	} from "$lib/stores";
	import { addIssue } from "$lib/supabaseClient";
	import { get } from "svelte/store";
	import Board from "./Board.svelte";
	import type { Issue } from "../../../types/collection";
	import { isDragging } from "$lib/stores";
	import { Button } from "$lib/components/ui/button";
	import * as Collapsible from "$lib/components/ui/collapsible";

	import { ChevronsUpDown } from "lucide-svelte";

	interface BoardColumn {
		id: number;
		name: string;
		items: Issue[];
		count?: number; // Optional property
	}

	interface BoardRow {
		id: number;
		name: string;
		columns: BoardColumn[];
	}

	const Configs = {
		state: [
			{ id: 0, name: "Open" },
			{ id: 1, name: "DOING" },
			{ id: 2, name: "DONE" },
		],
		priority: [
			{ id: 0, name: "High" },
			{ id: 1, name: "Medium" },
			{ id: 2, name: "Low" },
		],
	};

	let issues = get(filteredIssuesForSnapshot);
	let filteredIssues = issues;

	let rows: BoardRow[] = [];
	let board: BoardRow[] = [];
	let names: BoardColumn[] = [];
	let columnCounts;

	let filters = {
		rowByField: "priority",
		columnByField: "state",
		orderByField: "id",
		orderDirection: "asc",
		hideEmptyRows: false,
		hideEmptyColumns: false,
		hideNullRows: false,
		hideNullColumns: false,
	};

	let hydrated = false;

	const unsubscribefilter = filterStoreKanBan.subscribe((value) => {
		if (hydrated) {
			filters = value;
			// Call the required code whenever the filters are updated
			console.log("Filters updated:", filters);
			updateBoard();
		}

		// Your code to handle filter changes
		hydrated = true;
	});

	const unsubscribe = filteredIssuesDataStore.subscribe((value) => {
		filteredIssues = value;
		updateBoard();
	});

	function updateBoard() {
		console.trace("asd");

		const configRows =
			filters.rowByField !== "none" ? Configs[filters.rowByField] : null;
		const configColumns = Configs[filters.columnByField];

		if (configColumns) {
			if (configRows) {
				rows = configRows.map((rowConfig, rowIndex) => ({
					id: rowIndex,
					name: rowConfig.name,
					columns: configColumns.map((colConfig, colIndex) => ({
						id: colIndex,
						name: colConfig.name,
						items: [],
					})),
					no: rowIndex,
					rowBy: rowConfig.name,
				}));
			} else {
				rows = [
					{
						id: 0,
						name: "",
						columns: configColumns.map((colConfig, colIndex) => ({
							id: colIndex,
							name: colConfig.name,
							items: [],
							no: colIndex,
							columnBy: colConfig.name,
						})),
					},
				];
			}
			board = transformIssuesToBoard(filteredIssues);
		} else {
			console.warn(
				`No configuration found for field: ${filters.columnByField}`
			);
		}

		applyHideEmptyRowsAndColumns();
		const columnCountMap: { [key: string]: number } = {};

		// Populate the map with counts
		board.forEach((row) => {
			row.columns.forEach((column) => {
				if (columnCountMap[column.name]) {
					columnCountMap[column.name] += column.items.length;
				} else {
					columnCountMap[column.name] = column.items.length;
				}
			});
		});

		// Convert the map to an array of { name, count } objects
		columnCounts = Object.entries(columnCountMap).map(([name, count]) => ({
			name,
			count,
		}));
	}

	function applyHideEmptyRowsAndColumns() {
		if (filters.hideEmptyRows) {
			board = board.filter((row) =>
				row.columns.some((col) => col.items.length > 0)
			);
		}

		if (filters.hideEmptyColumns) {
			let columnsToKeep = new Set<string>();

			board.forEach((row) => {
				row.columns.forEach((column) => {
					if (column.items.length > 0) {
						columnsToKeep.add(column.name);
					}
				});
			});

			board.forEach((row) => {
				row.columns = row.columns.filter((col) =>
					columnsToKeep.has(col.name)
				);
			});
		}

		if (filters.hideNullRows) {
			board = board.filter(
				(row) => row.name !== `no ${filters.rowByField}`
			);
		}

		if (filters.hideNullColumns) {
			board.forEach((row) => {
				row.columns = row.columns.filter(
					(col) => col.name !== `no ${filters.columnByField}`
				);
			});
		}
	}

	function transformIssuesToBoard(issues: Issue[]): BoardRow[] {
		let board: BoardRow[];

		if (filters.rowByField === "none") {
			board = [
				{
					id: 0,
					name: "All Issues",
					columns: Configs[filters.columnByField].map(
						(colConfig, colIndex) => ({
							id: colIndex,
							name: colConfig.name,
							items: [],
							no: colIndex,
							columnBy: colConfig.name,
						})
					),
					no: 0,
					rowBy: "All Issues",
				},
			];
		} else {
			board = rows.map((row) => ({
				id: row.id,
				name: row.name,
				columns: row.columns.map((column) => ({
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

		let nullRow: BoardRow | undefined;
		let nullColumnAdded = false;

		issues.forEach((issue) => {
			let row =
				filters.rowByField === "none"
					? board[0]
					: board.find((r) => r.name === issue[filters.rowByField]);
			if (!row) {
				if (!nullRow) {
					nullRow = {
						id: board.length,
						name: `no ${filters.rowByField}`,
						columns: Configs[filters.columnByField].map(
							(colConfig, colIndex) => ({
								id: colIndex,
								name: colConfig.name,
								items: [],
								no: colIndex,
								columnBy: colConfig.name,
							})
						),
						no: board.length,
						rowBy: `no ${filters.rowByField}`,
					};
					nullRow.columns.push({
						id: nullRow.columns.length,
						name: `no ${filters.columnByField}`,
						items: [],
						no: nullRow.columns.length,
						columnBy: `no ${filters.columnByField}`,
					});
					board.push(nullRow);
				}
				row = nullRow;
			}

			let column = row.columns.find(
				(col) => col.name === issue[filters.columnByField]
			);
			if (!column) {
				column = row.columns.find(
					(col) => col.name === `no ${filters.columnByField}`
				);
				if (!column) {
					column = {
						id: row.columns.length,
						name: `no ${filters.columnByField}`,
						items: [],
						no: row.columns.length,
						columnBy: `no ${filters.columnByField}`,
					};
					row.columns.push(column);
				}
				issue[filters.columnByField] = null;
			}
			column.items.push(issue);
		});

		// Ensure null columns are added to all rows
		board.forEach((row) => {
			if (
				!row.columns.find(
					(col) => col.name === `no ${filters.columnByField}`
				)
			) {
				row.columns.push({
					id: row.columns.length,
					name: `no ${filters.columnByField}`,
					items: [],
					no: row.columns.length,
					columnBy: `no ${filters.columnByField}`,
				});
			}
		});

		// Ensure null row is added with null columns
		if (
			filters.rowByField !== "none" &&
			!board.find((row) => row.name === `no ${filters.rowByField}`)
		) {
			const nullRowColumns = Configs[filters.columnByField].map(
				(colConfig, colIndex) => ({
					id: colIndex,
					name: colConfig.name,
					items: [],
					no: colIndex,
					columnBy: colConfig.name,
				})
			);

			if (
				!nullRowColumns.find(
					(col) => col.name === `no ${filters.columnByField}`
				)
			) {
				nullRowColumns.push({
					id: nullRowColumns.length,
					name: `no ${filters.columnByField}`,
					items: [],
					no: nullRowColumns.length,
					columnBy: `no ${filters.columnByField}`,
				});
			}

			board.push({
				id: board.length,
				name: `no ${filters.rowByField}`,
				columns: nullRowColumns,
				no: board.length,
				rowBy: `no ${filters.rowByField}`,
			});
		}
		console.log(board);

		board.forEach((row) => {
			row.columns.forEach((column) => {
				column.items.sort((a, b) => {
					const sortResult = customSort(a, b, filters.orderByField);
					return filters.orderDirection === "asc"
						? sortResult
						: -sortResult;
				});
			});
		});

		return board;
	}
	function customSort(a, b, field) {
		if (a[field] === null || a[field] === undefined) return 1;
		if (b[field] === null || b[field] === undefined) return -1;

		if (field === "id") {
			return a.id - b.id;
		} else if (field === "name") {
			return a.name.localeCompare(b.name);
		} else if (field === "priority") {
			const priorityOrder = { High: 0, Medium: 1, Low: 2 };
			return priorityOrder[a.priority] - priorityOrder[b.priority];
		} else if (field === "state") {
			const stateOrder = { Open: 0, DOING: 1, DONE: 2 };
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

		updateBoard();
	}

	import gsap from "gsap";

	let boardContainer;
	let columnTitlesContainer;
	let isPanning = false;
	let startX = 0;
	let startY = 0;
	let scrollLeft = 0;
	let scrollTop = 0;

	const autoScrollThreshold = 50;
	const autoScrollSpeed = 200;
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
		boardContainer.style.cursor = "grabbing";
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		window.addEventListener("mouseleave", handleMouseLeave);
		console.log("Mouse down event:", {
			startX,
			startY,
			scrollLeft,
			scrollTop,
		});
	}

	function handleMouseUp() {
		isPanning = false;
		boardContainer.style.cursor = "grab";

		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
		window.removeEventListener("mouseleave", handleMouseLeave);
		console.log("Mouse up event");
	}

	function handleMouseLeave() {
		if (isPanning) {
			isPanning = false;
			boardContainer.style.cursor = "grab";
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			window.removeEventListener("mouseleave", handleMouseLeave);
			console.log("Mouse leave event");
		}
	}

	function handleMouseMove(event) {
		if ($isDragging) return;
		if (!isPanning) return;
		event.preventDefault();
		requestAnimationFrame(() => {
			const x = event.pageX - boardContainer.getBoundingClientRect().left;
			const y = event.pageY - boardContainer.getBoundingClientRect().top;
			let walkX = x - startX;
			let walkY = y - startY;

			// Adjust scroll positions
			let newScrollLeft = scrollLeft - walkX;
			let newScrollTop = scrollTop - walkY;

			// Constrain the scroll values within the limits
			newScrollLeft = Math.max(
				0,
				Math.min(
					boardContainer.scrollWidth - boardContainer.clientWidth,
					newScrollLeft
				)
			);
			newScrollTop = Math.max(
				0,
				Math.min(
					boardContainer.scrollHeight - boardContainer.clientHeight,
					newScrollTop
				)
			);

			// If the scroll position hits the limit, reset start positions to avoid dead dragging
			if (
				newScrollLeft === 0 ||
				newScrollLeft ===
					boardContainer.scrollWidth - boardContainer.clientWidth
			) {
				startX = x;
				scrollLeft = newScrollLeft;
			}

			if (
				newScrollTop === 0 ||
				newScrollTop ===
					boardContainer.scrollHeight - boardContainer.clientHeight
			) {
				startY = y;
				scrollTop = newScrollTop;
			}

			boardContainer.scrollLeft = newScrollLeft;
			boardContainer.scrollTop = newScrollTop;
		});
	}

	function handleAutoScroll() {
		const rect = boardContainer.getBoundingClientRect();

		let scrollX = 0;
		let scrollY = 0;

		const viewportHeight = window.innerHeight;

		if (mouseX < rect.left + autoScrollThreshold) {
			scrollX = -autoScrollSpeed;
		} else if (mouseX > rect.right - autoScrollThreshold) {
			scrollX = autoScrollSpeed;
		}
		if (mouseY < rect.top + autoScrollThreshold * 3) {
			scrollY = -autoScrollSpeed;
		} else if (mouseY > viewportHeight - autoScrollThreshold) {
			scrollY = autoScrollSpeed;
		}

		if (scrollX !== 0 || scrollY !== 0) {
			gsap.to(boardContainer, {
				scrollLeft: boardContainer.scrollLeft + scrollX,
				scrollTop: boardContainer.scrollTop + scrollY,
				duration: 1, // Adjust duration for smoothness
				ease: "power2.out",
			});

			console.log(
				`Auto-scrolling applied: scrollX=${scrollX}, scrollY=${scrollY}`
			);
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


	function handleWheel(event) {
		event.preventDefault();
		console.log("Wheel event detected");

		const delta = event.deltaY || event.detail || event.wheelDelta;
		const extraScroll = 150; // Extra scroll distance

		let newScrollTop = boardContainer.scrollTop + delta;

		// Adjust newScrollTop by adding or subtracting extraScroll
		if (delta > 0) {
			newScrollTop += extraScroll;
		} else {
			newScrollTop -= extraScroll;
		}

		// Ensure newScrollTop doesn't go beyond bounds
		newScrollTop = Math.max(
			0,
			Math.min(
				boardContainer.scrollHeight - boardContainer.clientHeight,
				newScrollTop
			)
		);

		gsap.to(boardContainer, {
			scrollTop: newScrollTop,
			duration: 0.5, // Adjust duration for smoothness
			ease: "power2.out",
		});
	}

	onMount(() => {
        
	

		boardContainer.addEventListener("mousedown", handleMouseDown);

		window.addEventListener("mousemove", handleGlobalMouseMove);

		window.addEventListener("wheel", handleWheel, { passive: true });

		return () => {
			boardContainer.removeEventListener("mousedown", handleMouseDown);

			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("wheel", handleWheel);
		};
	});

	onDestroy(() => {
		unsubscribe();
	});

	function applyHideEmptyRowsAndColumns2() {
		if (filters.hideEmptyRows) {
			board = board.filter((row) =>
				row.columns.some((col) => col.items.length > 0)
			);
		}

		if (filters.hideEmptyColumns) {
			let columnsToKeep = new Set<string>();

			board.forEach((row) => {
				row.columns.forEach((column) => {
					if (column.items.length > 0) {
						columnsToKeep.add(column.name);
					}
				});
			});

			board.forEach((row) => {
				row.columns = row.columns.filter((col) =>
					columnsToKeep.has(col.name)
				);
			});
		}

		// Trigger reactivity by updating the board array
		board = [...board];
	}
</script>

<div
	bind:this="{boardContainer}"
	class="board-container"
	on:mousedown="{handleMouseDown}"
	on:mouseup="{handleMouseUp}"
	on:mouseleave="{handleMouseLeave}"
	on:mousemove="{handleMouseMove}"
	role="application"
>
	<div class="internals">
		<div class="column-titles-container header-wrapper">
			<div class="column-titles">
				{#each columnCounts as column}
					<div class="column-title">
						<div class="font-default text-slate-300">
							<h1>
								<span class="key font-semibold text-lg">
									{column.name}</span
								>
								<span class="issues-count ml-1"
									>{column.count}</span
								>
							</h1>
						</div>
					</div>
				{/each}
			</div>
		</div>

		{#each board as row (row.id)}
			<Collapsible.Root open="{true}">
				<div class="header-container">
					<div class="font-default text-slate-300 header-row">
						<h1>
							<span>
								<Collapsible.Trigger>
									<Button
										variant="outline"
										class="bg-transparent border-none group p-0 m-0"
									>
										<ChevronsUpDown
											class="w-4 h-4 text-current group-hover:text-highlight-color"
										/>
									</Button>
								</Collapsible.Trigger>
							</span>
							<span class="key font-semibold text-lg">
								{row.name}</span
							>
							<span class="issues-count ml-1"
								>{issues.length}</span
							>
						</h1>
					</div>
				</div>

				<div class="collapsible-content">
					<Collapsible.Content>
						<Board
							items="{row.columns}"
							rowName="{row.name}"
							rowByField="{filters.rowByField}"
							columnByField="{filters.columnByField}"
							orderBy="{filters.orderByField}"
							applyHideEmptyRowsAndColumns="{applyHideEmptyRowsAndColumns2}"
							{board}
						/>
					</Collapsible.Content>
				</div>
			</Collapsible.Root>
		{/each}
	</div>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
	}

	.main-container {
		user-select: none; /* user */
	}
	.board-container {
		overflow-y: auto;
		overflow-x: auto;

		height: 100%;
		cursor: grab;
		user-select: none; /* user */
	}

	.column-titles-container {
		user-select: none; /* user */
		position: sticky;
		position: -webkit-sticky; /* Safari */

		top: 0;

		padding-top: 2em;
		background: rgb(6, 6, 8);
		z-index: 10;
		height: 7.5%;
		margin-right: -2em;
	}

	.column-titles {
		display: flex; /* Change to inline-flex to allow horizontal scrolling */
		justify-content: flex-start;
		padding-left: 2.05em;
		padding-right: 2.05em;

		top: 0;
	}

	.column-title {
		flex: 1; /* Allow the title to grow and shrink as needed */
		padding: 0.5em;
		padding-left: 1.5em;
		margin-right: 3em; /* Adjust margin as needed */
		display: flex; /* Use flexbox for centering content */
		align-items: center; /* Vertically center content */
		justify-content: flex-start; /* Align items to the left */
		text-align: center; /* Center text */
		max-width: 320px; /* Set maximum width */
		min-width: 250px; /* Set minimum width */
	}

	.internals {
		width: fit-content;
	}

	.header-row {
		position: -webkit-sticky;
		position: sticky;
		top: 0;
		left: 0;
		padding-left: 1em;
		z-index: 9; /* Ensure it stays behind the column titles but above the board */
		width: 500px;
	}

	.header-container {
		user-select: none; /* user */

		position: -webkit-sticky; /* Safari */
		position: sticky;

		top: 70px;
		margin-right: -0.5em;

		z-index: 5;
		margin-left: 1.5em;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
		padding-top: 0.25em;
		background: hsla(207, 17%, 49%, 0.815);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);

		border-radius: 8px;
	}

	.header-wrapper {
		background: hsla(0, 0%, 0%, 0.6);

		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
</style>
