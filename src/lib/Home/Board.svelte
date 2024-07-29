<script lang="ts">
	import { onMount } from "svelte";

	import { fade, crossfade } from "svelte/transition";
	import { gsap } from "gsap";
	import Grid, { GridItem, type LayoutChangeDetail } from "$lib/Home/svelte-grid-extended";
	import Pomodoro from "./Widgets/Pomodoro.svelte";
	import { settings, gridController } from "$lib/stores";
	import { setSetting } from "$lib/supabaseClient";
	import { writable } from "svelte/store";
	import { quintOut } from "svelte/easing";
	import { derived } from "svelte/store";
	import { Maximize, Minimize, Move, X } from "lucide-svelte";

	import type { UserSettings, GridItemType, ChartOptions } from "../../types/collection";
	import BarChartBase from "./Widgets/BarChartBase.svelte";
    import LineChartBase from "./Widgets/LineChartBase.svelte";
    import PieChartBase from "./Widgets/PieChartBase.svelte";
    import HeatMapBase from "./Widgets/HeatMapBase.svelte";
    import MetricChartBase from "./Widgets/metricBarBase.svelte";
    import MetricLinebase from "./Widgets/metricLinebase.svelte";
	import Matrix from "./Widgets/Matrix.svelte";
    import Metric from "./Widgets/metrics/metric.svelte";
	const componentMapArray = [
		{ type: "pomodoro", component: Pomodoro },
		{ type: "barchartbase", component: BarChartBase },
        { type: "linechartbase", component: LineChartBase },
        { type: "piechartbase", component: PieChartBase },
        { type: "heatmapbase", component: HeatMapBase },
        { type: "matrixmapbase", component: Matrix },
        { type: "metricbarchartbase", component: MetricChartBase },
        { type: "metriclinechartbase", component: MetricLinebase },
        { type: "metrictbase", component: Metric }
	];

	const componentMap: { [key: string]: any } = {};
	componentMapArray.forEach((item) => {
		componentMap[item.type] = item.component;
	});

	let items = writable<GridItemType[]>();
	let gap = 10;
	const gridLayouts = derived(settings, ($settings) => $settings.home.grid);

	gridLayouts.subscribe((value) => {
		let isSimple = value.usingSimple;
		let grid = value.gridLayout;
		let focus = value.focusLayout;

		if (isSimple) {
			items.set(focus);
		} else {
			items.set(grid);
		}
	});

	items.subscribe(() => {
		console.log($settings);

		setSetting($settings);
	});

	let itemSize: { width: number; height: number };

	let showExpandedIcon = true;

	let expandedItem: string | null = null;

	let expandedBounds: {
		left: number;
		top: number;
		width: number;
		height: number;
	} = { left: 0, top: 0, width: 0, height: 0 };
	let isAnimating = false;

	function toggleContract(id, removeImmediately = false) {
        console.log($gridController);
        
		if (expandedItem === id) {
			// If already expanded, collapse it or remove immediately
			showExpandedIcon = true;
			const element = document.querySelector(`.grid-item-${id}`);
			if (!element) return;

			if (removeImmediately) {
				// Remove the expanded item immediately
				element.remove();
				expandedItem = null;
			} else {
				// Animate the collapse

				gsap.set(element, {
					width: parseFloat(element.style.width),
					height: parseFloat(element.style.height),
					left: parseFloat(element.style.left),
					top: parseFloat(element.style.top),
				});

				gsap.to(element, {
					width: expandedBounds.width,
					height: expandedBounds.height,
					left: expandedBounds.left,
					top: expandedBounds.top,
					duration: 0.75,
					ease: "power1.inOut",
					onComplete: () => {
						expandedItem = null;
					},
				});
			}

			$items.forEach((item) => {
				if (item.id !== id) {
					const element = document.querySelector(`.grid-item-${item.id}`);
					isAnimating = true;
					gsap.to(element, {
						x: 0,
						y: 0,
						duration: 0.75,
						ease: "power1.inOut",
						onComplete: () => {
							isAnimating = false; // Reset animation flag
						},
					});
				}
			});
		}
	}
	// Store original states
	let originalStates = {};

	function toggleExpand(id) {
        console.log($gridController);
        
		if (isAnimating) return; // Prevent toggling if animation is in progress
     
		if (expandedItem === id) {
			toggleContract(id);
			return;
		}

		const itemToExpand = $items.find((item) => item.id === id);
        
		if (!itemToExpand) return;
        if (!itemToExpand.type.isExpandable) return;
       
        
		if (!(expandedItem === id)) {
			console.log(expandedItem);

			// If already expanded, collapse it
			expandedItem = id;
			showExpandedIcon = false;
			const expandingElement = document.querySelector(`.grid-item-${id}`);
			if (!expandingElement) return;

			let left = parseFloat(expandingElement.style.left);
			let top = parseFloat(expandingElement.style.top);

			// Store the original state
			originalStates[id] = {
				width: expandingElement.style.width,
				height: expandingElement.style.height,
				left: expandingElement.style.left,
				top: expandingElement.style.top,
				x: gsap.getProperty(expandingElement, "x"),
				y: gsap.getProperty(expandingElement, "y"),
			};

			expandedBounds = {
				left,
				top,
				width: parseFloat(expandingElement.style.width),
				height: parseFloat(expandingElement.style.height),
			};

			isAnimating = true; // Set animation flag

			console.log($gridController.gridParams);

			let gridPerams = $gridController.gridParams;

			let mainWidth =
				gridPerams.cols *
					(gridPerams.itemSize
						? gridPerams.itemSize.width + gridPerams.gap + 1
						: window.innerWidth - 124) - 20;

			let mainHeight =
				gridPerams.rows *
					(gridPerams.itemSize
						? gridPerams.itemSize.height + gridPerams.gap + 1
						: window.innerHeight - 115) - 20;


            mainWidth = Math.round(mainWidth);
            mainHeight = Math.round(mainHeight);

			gsap.to(expandingElement, {
				width: mainWidth - 2,
				height: mainHeight - 2,
				left: 10,
				top: 10,
				duration: 0.75,
				ease: "power1.inOut",
				onComplete: () => {
					isAnimating = false; // Reset animation flag
				},
			});

			// Animate other items to move out of the way
			const intersectingItemsRight = findAllIntersections(itemToExpand, $items, "right");
			const intersectingItemsLeft = findAllIntersections(itemToExpand, $items, "left");

			const allIntersectingItems = new Set([
				...intersectingItemsRight,
				...intersectingItemsLeft,
			]);

			$items.forEach((item) => {
				if (item.id !== id) {
					const element = document.querySelector(`.grid-item-${item.id}`);
					let translateX = 0;
					let translateY = 0;
					let left = parseFloat(expandingElement.style.left) || 0;
					let top = parseFloat(expandingElement.style.top) || 0;
					let leftEl = parseFloat(element.style.left) || 0;
					let topEl = parseFloat(element.style.top) || 0;

					// Store the original state
					originalStates[item.id] = {
						left: leftEl,
						top: topEl,
						x: gsap.getProperty(element, "x"),
						y: gsap.getProperty(element, "y"),
					};

					if (item.y < itemToExpand.y) {
						translateY = -top + 10;
					} else if (item.y > itemToExpand.y) {
						translateY = mainHeight - expandedBounds.height;
					}

					if (allIntersectingItems.has(item)) {
						translateY = 0;
					}

					if (item.x < itemToExpand.x) {
						translateX = -left + 10;
					} else if (item.x > itemToExpand.x) {
						translateX = mainWidth - left - expandedBounds.width + 10;
					}

					if (translateY !== 0) {
						translateX = 0;
					}

					gsap.to(element, {
						x: translateX,
						y: translateY,
						duration: 0.75,
						ease: "power1.inOut",
					});
				}
			});
		}
	}

	function revertChanges() {
		console.log("asd");

		Object.keys(originalStates).forEach((id) => {
			const element = document.querySelector(`.grid-item-${id}`);
			const originalState = originalStates[id];

			// Kill any ongoing GSAP tweens for this element
			gsap.killTweensOf(element);

			// Revert to the original state using GSAP
			gsap.set(element, {
				width: originalState.width,
				height: originalState.height,
				left: originalState.left,
				top: originalState.top,
				x: originalState.x,
				y: originalState.y,
			});
		});
		expandedItem = null;
        showExpandedIcon = true;
        isAnimating = false
	}

	function remove(id) {
		if ($settings.home.grid.usingSimple) {
			$settings.home.grid.focusLayout = $items.filter((i) => i.id !== id);
		} else {
			$settings.home.grid.gridLayout = $items.filter((i) => i.id !== id);
		}

		setSetting($settings);
		toggleContract(id, true);
	}

	onMount(() => {
		window.addEventListener("resize", revertChanges);

		return () => {
			window.removeEventListener("resize", revertChanges, true);
		};
	});

	function isIntersecting(item1, item2) {
		const item1Start = item1.y;
		const item1End = item1.y + item1.h;
		const item2Start = item2.y;
		const item2End = item2.y + item2.h;

		return item1Start < item2End && item1End > item2Start;
	}

	function findAllIntersections(rootItem, itemList, direction) {
		const result = [];
		const visited = new Set();

		function sweep(item) {
			for (const otherItem of itemList) {
				if (item.id !== otherItem.id && !visited.has(otherItem.id)) {
					if (direction === "right" && otherItem.x < item.x) continue;
					if (direction === "left" && otherItem.x > item.x) continue;
					if (isIntersecting(item, otherItem)) {
						result.push(otherItem);
						visited.add(otherItem.id);
						sweep(otherItem);
					}
				}
			}
		}

		visited.add(rootItem.id);
		sweep(rootItem);

		return result;
	}
</script>

<div class="board-container">
	<div class="board-for-grid">
		<Grid
			{itemSize}
			cols="{12}"
			rows="{12}"
			{gap}
			bind:controller="{$gridController}"
			class="grid-container"
			autoCompress="{false}"
			readOnly="{expandedItem === null ? false : true}"
		>
			{#each $items as item (item.id)}
				<div transition:fade="{{ duration: 150 }}" id="{item.id}" class="grid-item-wrapper">
					<GridItem
						id="{item.id}"
						bind:x="{item.x}"
						bind:y="{item.y}"
						bind:w="{item.w}"
						bind:h="{item.h}"
						bind:min="{item.min}"
						bind:max="{item.max}"
						class="grid-item grid-item-{item.id}"
					>

                   
                            <div slot="moveHandle" let:moveStart class="move-handle">
                                <div
                                    class="w-full h-10 rounded-md cursor-move items-center  
                                        absolute left-0 top-0 hover:bg-slate-700 flex justify-start"
                                    on:pointerdown="{moveStart}"
                                >
                                </div>
                            </div>
            
                            <button
                                    on:click|stopPropagation="{() => toggleExpand(item.id)}"
                                    class="expand absolute right-8 top-0 rounded-md hover:bg-slate-500 p-1 m-1"
                                >   
                                {#if item.type.isExpandable && !(item.w === 12 && item.h === 12)}
                                        {#if showExpandedIcon === false}
                                        <Minimize
                                            class="w-6 h-6 text-current group-hover:text-highlight-color"
                                        />
                                    {:else}
                                        <Maximize
                                            class="w-6 h-6 text-current group-hover:text-highlight-color"
                                        />
                                    {/if}
                                {/if}
                                    
                                </button>

                                <button
                                    on:click|stopPropagation="{() => remove(item.id)}"
                                    class="contract-btn absolute top-0 right-px m-1 rounded-md hover:bg-slate-500"
                                >
                                    <X class="w-6 h-6 text-current group-hover:text-highlight-color m-1 " />
                                    
                                </button>

                              
                        
                                <svelte:component this="{componentMap[item.type.type]}" {item} />
                             
                                    <!-- <div class="w-full h-full flex align-middle justify-center">
                                        <h1 class="text-center flex items-center justify-center h-full w-full"> 
                                            expand to see
                                        </h1>
                                    </div> -->
                                
                          
                               
						
					</GridItem>
				</div>
			{/each}
		</Grid>
	</div>
</div>

<style>
	.item {
		height: 100%;
		width: 100%;
		border-radius: 8px;
	}

	.remove,
	.contract-btn,
	.remove-btn,
	.move-handle div,
	.expand {
		/* opacity: 0; */
		transition:
        /* opacity 0.6s ease, */ background-color 0.3s ease;
	}

	.grid-item-wrapper:hover .remove,
	.grid-item-wrapper:hover .contract-btn,
	.grid-item-wrapper:hover .remove-btn,
	.grid-item-wrapper:hover .move-handle div,
	.grid-item-wrapper:hover .expand {
		opacity: 1;
	}

	:global(.grid-item) {
		background-color: #36383b; /* make sure to change the points */
		border-radius: 8px;
	}

	.move-handle {
		background-color: red;
	}

	.board-for-grid {
		width: 100%;
		height: 100%;
	}

	.board-container {
		width: 100%;
		height: 100%;
		padding: 0.75rem;
   
   
	}
</style>
