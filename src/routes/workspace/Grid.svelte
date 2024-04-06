
<script lang="ts">
    import Grid from "svelte-grid";
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import CustomComponentA from './Pomodoro.svelte';
    import {showModal, selectedItem} from '../../stores'


    const componentMap = {

    'specificId1': CustomComponentA,
    'specificId2': CustomComponentA,
    // Add more mappings as needed
    };

    function isItemID(key: any): key is ItemID {
        return key in componentMap;
    }

    function getComponentForItem(item: { id: any }) {
        if (isItemID(item.id)) {
        return componentMap[item.id];
        } else {
        return CustomComponentA;
        }
    }


    const COLS = 6;

    const id = () => "_" + Math.random().toString(36).substr(2, 9);

    const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

    let items = [
    {
        [COLS]: gridHelp.item({
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        }),
        id: 'specificId1',
    },

    {
        [COLS]: gridHelp.item({
        x: 2,
        y: 0,
        w: 2,
        h: 2,
        }),
        id: 'specificId2',
    },
    ];

const cols = [[600, 6]];

function add() {
  let newItem = {
    6: gridHelp.item({
      w: Math.round(randomNumberInRange(1, 4)),
      h: Math.round(randomNumberInRange(1, 4)),
      x: 0,
      y: 0,
    }),
    id: id(),
  };

  let findOutPosition = gridHelp.findSpace(newItem, items, COLS);

  newItem = {
    ...newItem,
    [COLS]: {
      ...newItem[COLS],
      ...findOutPosition,
    },
  };

  items = [...items, ...[newItem]];
}
 


const remove = (item) => {
  items = items.filter((value) => value.id !== item.id);

  if (adjustAfterRemove) {
    items = gridHelp.adjust(items, COLS);
  }
};

let adjustAfterRemove = false;



function handleItemClick(item) {
    selectedItem.set(item);
    showModal.set(true);
  }


</script>


<style>
    .size {
      max-width: 1100px;
      width: 100%;
    }
    .demo-widget {
      background: #f1f1f1;
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-width: 5px;
    }
    
    .demo-container {
      /* max-width: 800px;; */
      width: 100%;
      color: aqua;
   
    }

    .remove { 
        cursor: pointer;
        position: absolute;
        right: 5px; 
        top: 3px;
        user-select: none;
    }

    .dragger {
        cursor: default;
        user-select: none;
        color: white;
        line-height: 30px;
        text-align: center;
        background: black;
        width: 100px;
        height: 30px;
        margin-top: 10px;
        border-radius: 3px;
        position: absolute;
        top: 5px;
        left: 5px;
}
    </style>


<button on:click={add}>Add (random size)</button>

<label>
  <input type="checkbox" bind:checked={adjustAfterRemove} />
  Adjust elements after removing an item
</label>

<div class=demo-container>
  <Grid bind:items={items} rowHeight={100} let:item let:dataItem {cols}>
    <div class="demo-widget" on:click={() => handleItemClick(dataItem)}>
      <span on:pointerdown={e => e.stopPropagation()}
        on:click={() => remove(dataItem)}
        class=remove
        >
        ✕
      </span>
      <svelte:component this={getComponentForItem(item)} />


    </div>
  </Grid>
</div>

