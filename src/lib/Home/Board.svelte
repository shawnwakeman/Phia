<script lang="ts">
	import { onMount } from "svelte";
	
	import { fade, crossfade } from 'svelte/transition';
	import { gsap } from "gsap";
	import Grid, {
		GridItem,
		type LayoutChangeDetail,
	} from "$lib/Home/svelte-grid-extended";
	import Pomodoro from "./Widgets/Pomodoro.svelte";
	import { settings, gridController } from "$lib/stores";
	import { setSetting } from "$lib/supabaseClient";
	import { writable } from "svelte/store";
	import { quintOut } from 'svelte/easing';
	import { derived } from "svelte/store";
    import { Maximize, Minimize, Move, X} from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button";





	let items = writable<{
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
        min: {
            w: number;
            h: number;
        };
        max: {
            w: number;
            h: number;
        };
    }[]>();
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
        
        setSetting($settings)
        
	});

    
    let itemSize;

	let parentDiv: HTMLDivElement;

	function updateItemSize() {
		if (parentDiv) {
			const parentWidth = parentDiv.clientWidth;
			const parentHeight = parentDiv.clientHeight;

			itemSize = {
				width: parentWidth / 10,
				height: parentHeight / 10
			};
		}
	}

    let showExpandedIcon = true;



	let expandedItem = null;
	let expandedWidth = null;
	let expandedHeight = null;

	function toggleContract(id) {
		if (expandedItem === id) {
			// If already expanded, collapse it
            showExpandedIcon = true
			const element = document.querySelector(`.grid-item-${id}`);
			gsap.to(element, {
				width: expandedWidth,
				height: expandedHeight,
				x: 0,
				y: 0,
				duration: 1,
				ease: "power2.out",
                onComplete: () => {
                    expandedItem = null;
                    expandedHeight = null;
                    expandedWidth = null;
                }
			});

			$items.forEach((item) => {
				if (item.id !== id) {
					const element = document.querySelector(
						`.grid-item-${item.id}`
					);
					gsap.to(element, {
						x: 0,
						y: 0,
						duration: 1,
						ease: "power2.out",
                        
					});
				}
			});


		}
	}

// Store original states
let originalStates = {};

function toggleExpand(id) {
    if (expandedItem === id) {
        toggleContract(id)
        return;
    }
    const itemToExpand = $items.find((item) => item.id === id);
    if (!itemToExpand) return;

    if (!(expandedItem === id)) {
        console.log(expandedItem);

        // If already expanded, collapse it
        expandedItem = id;
        showExpandedIcon = false
        const expandingElement = document.querySelector(`.grid-item-${id}`);
        let left = parseInt(expandingElement.style.left);
        let top = parseInt(expandingElement.style.top);

        // Store the original state
        originalStates[id] = {
            width: expandingElement.style.width,
            height: expandingElement.style.height,
            left: expandingElement.style.left,
            top: expandingElement.style.top,
            x: gsap.getProperty(expandingElement, "x"),
            y: gsap.getProperty(expandingElement, "y"),
        }

        expandedWidth = parseInt(expandingElement.style.width);
        expandedHeight = parseInt(expandingElement.style.height);


        gsap.to(expandingElement, {
            width: window.innerWidth - 100,
            height: window.innerHeight - 88,
            x: 10 - left,
            y: 10 - top,
            duration: 1,
            ease: "power2.out",
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
                let left = parseInt(expandingElement.style.left) || 0;
                let top = parseInt(expandingElement.style.top) || 0;
                let leftEl = parseInt(element.style.left) || 0;
                let topEl = parseInt(element.style.top) || 0;
                let width = parseInt(element.style.width);
                let height = parseInt(element.style.height);

                // Store the original state
                originalStates[item.id] = {
                    left: leftEl,
                    top: topEl,
                    x: gsap.getProperty(element, "x"),
                    y: gsap.getProperty(element, "y"),
                };

                if (item.y < itemToExpand.y) {
                    translateY = -top;
                } else if (item.y > itemToExpand.y) {
                    translateY = window.innerHeight - expandedHeight - 80;
                }

                if (allIntersectingItems.has(item)) {
                    translateY = 0;
                }

                if (item.x < itemToExpand.x) {
                    translateX = -left;
                } else if (item.x > itemToExpand.x) {
                    translateX = window.innerWidth - left - expandedWidth - 80;
                }

                console.log(left, translateY, item.id.slice(0, 5), window.innerWidth, leftEl);

                if (translateY !== 0) {
                    translateX = 0;
                }

                gsap.to(element, {
                    x: translateX,
                    y: translateY,
                    duration: 1,
                    ease: "power2.out",
                });
            }
        });
    }
}

function revertChanges() {
    console.log("asd");
    
    updateItemSize()
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
}


	function handleResize() {
		let id = expandedItem;
		if (id) {
			console.log(id);
			// If already expanded, collapse it
			const element = document.querySelector(`.grid-item-${id}`);
			gsap.to(element, {
				width: expandedWidth,
				height: expandedHeight,
				x: 0,
				y: 0,
				duration: 0,
				ease: "power2.out",
			});

			$items.forEach((item) => {
				if (item.id !== id) {
					const element = document.querySelector(
						`.grid-item-${item.id}`
					);
					gsap.to(element, {
						x: 0,
						y: 0,
						duration: 0,
						ease: "power2.out",
					});
				}
			});

			expandedItem = null;
			expandedHeight = null;
			expandedWidth = null;
		}
	}

	function remove(id) {
		if ($settings.home.grid.usingSimple) {
			$settings.home.grid.focusLayout = $items.filter((i) => i.id !== id);
		} else {
			$settings.home.grid.gridLayout = $items.filter((i) => i.id !== id);
		}

		setSetting($settings);
	}

    

	onMount(() => {
		window.addEventListener("resize", revertChanges);
    
        updateItemSize(); // Initial update


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

<div class="board-for-grid">
	<Grid
		{itemSize}
        cols={10} 
        rows={10}
        
		{gap}

		bind:controller="{$gridController}"
		class="grid-container"
		autoCompress="{false}"
	>
		{#each $items as item (item.id)}
			<div transition:fade="{{ duration: 300 }}" id="{item.id}" class="grid-item-wrapper">
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
                        class=" rounded-md cursor-move w-8 flex items-center justify-center absolute left-px top-0 p-1 m-0.5 hover:bg-slate-500"
                        on:pointerdown="{moveStart}"
                    >
                        <Move class="w-6 h-6 text-current group-hover:text-highlight-color" />
                    </div>
                </div>

                    <button
                        on:pointerdown="{(e) => e.stopPropagation()}"
                        on:click="{() => toggleExpand(item.id)}"
                        class="expand absolute left-7 top-0 rounded-md hover:bg-slate-500 p-1 m-0.5"
                    >
                        {#if showExpandedIcon === false}
                            <Minimize class="w-6 h-6 text-current group-hover:text-highlight-color"/>
                        {:else}
                            <Maximize class="w-6 h-6 text-current group-hover:text-highlight-color"/>
                        {/if}
                    </button>

                  

					<button
						on:pointerdown="{(e) => e.stopPropagation()}"
						on:click="{() => remove(item.id)}"
                        class="contract-btn absolute top-0 right-px  m-0.5 rounded-md hover:bg-slate-500"
					>
						<X class="w-6 h-6 text-current group-hover:text-highlight-color m-1 "/>
					</button>

				

					<div class="item">{item.id.slice(0, 5)}</div>
				</GridItem>
			</div>
		{/each}
	</Grid>
</div>

<style>
	.item {
		background-color: rgb(150, 150, 150);
		width: 100%;
		height: 100%;
        border-radius: 8px;
	}

	.remove, .contract-btn, .remove-btn, .move-handle div, .expand {
		opacity: 0;
        transition: opacity 0.6s ease, background-color 0.3s ease;
	}

	.grid-item-wrapper:hover .remove,
	.grid-item-wrapper:hover .contract-btn,
	.grid-item-wrapper:hover .remove-btn,
	.grid-item-wrapper:hover .move-handle div,
	.grid-item-wrapper:hover .expand {
		opacity: 1;

	}

	:global(.grid-item) {
		display: flex;
		flex-direction: column;
		background-color: #cbd5e1; /* Equivalent to bg-slate-300 */
		border-radius: 8px;
		position: relative;
	}


    .move-handle {
		flex-shrink: 0;
	}




	.board-for-grid {
	
        width: 100%;
        height: 100%;

	}
</style>