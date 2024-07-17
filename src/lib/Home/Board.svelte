

<script>
    import { onMount } from 'svelte';
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { gsap } from 'gsap';
    import Grid, { GridItem } from 'svelte-grid-extended';
    import Pomodoro from './Widgets/Pomodoro.svelte';



    let gap = 10

	let items = [
		{ id: crypto.randomUUID(), x: 0, y: 0, w: 2, h: 5 },
		{ id: crypto.randomUUID(), x: 2, y: 2, w: 2, h: 2 },
		{ id: crypto.randomUUID(), x: 2, y: 0, w: 1, h: 2 },
		{ id: crypto.randomUUID(), x: 3, y: 0, w: 2, h: 2 },
		{ id: crypto.randomUUID(), x: 4, y: 2, w: 1, h: 3 },
		{ id: crypto.randomUUID(), x: 8, y: 0, w: 2, h: 8 },
		{ id: crypto.randomUUID(), x: 4, y: 5, w: 1, h: 1 },
		{ id: crypto.randomUUID(), x: 2, y: 6, w: 3, h: 2 },
		{ id: crypto.randomUUID(), x: 2, y: 4, w: 2, h: 2 }
	];

	const itemsBackup = structuredClone(items);

	const itemSize = { width: 100, height: 100 };

	function resetGrid() {
		items = structuredClone(itemsBackup);
	}


    let expandedItem = null;
    let expandedWidth = null;
    let expandedHeight = null;

    function toggleContract(id) {
  

        if (expandedItem === id) {
            // If already expanded, collapse it
            const element = document.querySelector(`.grid-item-${id}`);
            gsap.to(element, {
                width: expandedWidth,
                height: expandedHeight,
                x: 0,
                y: 0,
                duration: 1,
                ease: "power2.out"
            });

            items.forEach(item => {
        
                if (item.id !== id) {
                    const element = document.querySelector(`.grid-item-${item.id}`);
                    gsap.to(element, {
                        x: 0,
                        y: 0,
                        duration: 1,
                        ease: "power2.out"
                    });
                }
            });

            expandedItem = null;
            expandedHeight = null;
            expandedWidth = null
        }

            
    }
    function toggleExpand(id) {
        const itemToExpand = items.find(item => item.id === id);
        if (!itemToExpand) return;

        if (!(expandedItem === id)) {

            console.log(expandedItem);

            
            // If already expanded, collapse it
            expandedItem = id;
            
            const expandingElement = document.querySelector(`.grid-item-${id}`);
            let left = parseInt(expandingElement.style.left);
            let top = parseInt(expandingElement.style.top);

            expandedWidth = parseInt(expandingElement.style.width)
            expandedHeight = parseInt(expandingElement.style.height);
            gsap.to(expandingElement, {
                width: window.innerWidth - 100,
                height: window.innerHeight - 100,
                x: 10 - left,
                y: 10 - top,
                duration: 1,
                ease: "power2.out"
            });

            
            // Animate other items to move out of the wa
            const intersectingItemsRight = findAllIntersections(itemToExpand, items, 'right');
            const intersectingItemsLeft = findAllIntersections(itemToExpand, items, 'left');
            
            const allIntersectingItems = new Set([...intersectingItemsRight, ...intersectingItemsLeft]);


            items.forEach(item => {
            if (item.id !== id) {
                const element = document.querySelector(`.grid-item-${item.id}`) ;
                let translateX = 0;
                let translateY = 0;
                let left = parseInt(expandingElement.style.left) || 0; // Factor in current left
                let top = parseInt(expandingElement.style.top) || 0;
                let leftEl = parseInt(element.style.left) || 0; // Factor in current left
                let topEl = parseInt(element.style.top) || 0;
                let width = parseInt(element.style.width)
                let height = parseInt(element.style.height);

                if (item.y < itemToExpand.y) {
                    translateY = -top;
                } else if (item.y > itemToExpand.y) {
                    translateY = window.innerHeight - expandedHeight - 80;
                }
       
                if (allIntersectingItems.has(item)) {
                    translateY = 0;
                }
              
          
                if (item.x < itemToExpand.x) {
                  
                    translateX = - left + 10; // Move left by its own width
                } else if (item.x > itemToExpand.x) {
                    translateX = window.innerWidth - left - expandedWidth - 80 ;
                }

                console.log(left, translateY, item.id.slice(0, 5), window.innerWidth, leftEl);

             
                
                if (translateY !== 0) {
                    translateX = 0;
                }
              

                gsap.to(element, {
                    x: translateX,
                    y: translateY,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        });

        } 
    }

    

    function handleResize() {
        

        const itemToExpand = items.find(item => item.id === expandedItem);
        if (!itemToExpand) return;


            
            const expandingElement = document.querySelector(`.grid-item-${id}`);
            let left = parseInt(expandingElement.style.left);
            let top = parseInt(expandingElement.style.top);

            expandedWidth = parseInt(expandingElement.style.width)
            expandedHeight = parseInt(expandingElement.style.height);
            gsap.to(expandingElement, {
                width: window.innerWidth - 100,
                height: window.innerHeight - 100,
                x: 10 - left,
                y: 10 - top,
                duration: 1,
                ease: "power2.out"
            });

            
            // Animate other items to move out of the wa
            const intersectingItemsRight = findAllIntersections(itemToExpand, items, 'right');
            const intersectingItemsLeft = findAllIntersections(itemToExpand, items, 'left');
            
            const allIntersectingItems = new Set([...intersectingItemsRight, ...intersectingItemsLeft]);


            items.forEach(item => {
            if (item.id !== id) {
                const element = document.querySelector(`.grid-item-${item.id}`) ;
                let translateX = 0;
                let translateY = 0;
                let left = parseInt(expandingElement.style.left) || 0; // Factor in current left
                let top = parseInt(expandingElement.style.top) || 0;
                let leftEl = parseInt(element.style.left) || 0; // Factor in current left
  

                if (item.y < itemToExpand.y) {
                    translateY = -top;
                } else if (item.y > itemToExpand.y) {
                    translateY = window.innerHeight - expandedHeight - 80;
                }
       
                if (allIntersectingItems.has(item)) {
                    translateY = 0;
                }
              
          
                if (item.x < itemToExpand.x) {
                  
                    translateX = - left + 10; // Move left by its own width
                } else if (item.x > itemToExpand.x) {
                    translateX = window.innerWidth - left - expandedWidth - 80 ;
                }

                console.log(left, translateY, item.id.slice(0, 5), window.innerWidth, leftEl);

             
                
                if (translateY !== 0) {
                    translateX = 0;
                }
              

                gsap.to(element, {
                    x: translateX,
                    y: translateY,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        });

    } 
      

     
  

    // onMount(() => {
       
       
    //     //     window.addEventListener('resize', handleResize);

    //     //     return () => {

    //     //     window.removeEventListener('resize', handleResize, true);
    //     // };
    
    // });



    function isIntersecting(item1, item2) {
        const item1Start = item1.y;
        const item1End = item1.y + item1.h;
        const item2Start = item2.y;
        const item2End = item2.y + item2.h;

        return (item1Start < item2End && item1End > item2Start);
    }




    function findAllIntersections(rootItem, itemList, direction){
    const result = [];
    const visited = new Set();
    
    function sweep(item) {
        for (const otherItem of itemList) {
            if (item.id !== otherItem.id && !visited.has(otherItem.id)) {
                if (direction === 'right' && otherItem.x < item.x) continue;
                if (direction === 'left' && otherItem.x > item.x) continue;
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



// Helper variables to determine the grid cell dimensions
const gridCellWidth = 100; // Assume each grid cell is 100 pixels wide
const gridCellHeight = 100; // Assume each grid cell is 100 pixels high

	let gridController;

	function addNewItem() {
		const w = Math.floor(Math.random() * 2) + 1;
		const h = Math.floor(Math.random() * 5) + 1;
		const newPosition = gridController.getFirstAvailablePosition(w, h);
		items = newPosition
			? [...items, { id: crypto.randomUUID(), x: newPosition.x, y: newPosition.y, w, h }]
			: items;
	}
</script>



<div class="board-for-grid">
    <Grid {itemSize} cols={10}  gap={gap} collision="compress" bind:controller={gridController} class="grid-container">
    
        {#each items as item (item.id)}
            <div transition:fade={{ duration: 300 }} id={item.id}>
                <GridItem id={item.id} bind:x={item.x} bind:y={item.y} bind:w={item.w} bind:h={item.h} class="grid-item grid-item-{item.id}">
                   
                    <div slot="moveHandle" let:moveStart>
                        <div class=" bg-slate-600 rounded text-white cursor-move" on:pointerdown={moveStart}>
                            MOVE
                        </div>
                    </div>
    
                    <button
                        on:pointerdown={(e) => e.stopPropagation()}
                        on:click={() => toggleExpand(item.id)}
                        class="remove"
                    >
                        ✕
                    </button>

                    <button
                    on:pointerdown={(e) => e.stopPropagation()}
                    on:click={() => toggleContract(item.id)}
            
                >
                    ✕
                </button>
      
                
          
    
                    <div class="item">{item.id.slice(0, 5)}</div>
                </GridItem>
            </div>
        {/each}
    </Grid>

</div>



<style>
	.item {
		display: grid;
		place-items: center;
		background-color: rgb(150, 150, 150);
		width: 100%;
		height: 100%;
	}
	.remove {
		cursor: pointer;
		position: absolute;
		right: 10px;
		top: 3px;
	}
	.btn {
		margin-top: 10px;
		margin-left: 10px;
		right: 2px;
		top: 1px;
	}
    :global(.grid-item) {
        display: flex;
        flex-direction: column;
        gap: 12px; /* Equivalent to gap-3 */
        background-color: #cbd5e1; /* Equivalent to bg-slate-300 */
        padding: 12px; /* Equivalent to p-3 */
    }

    .board-for-grid {
  
        padding: 12px;
    }




</style>