<!-- Square.svelte -->
<!-- Square.svelte -->
<script>
    import { get, writable } from 'svelte/store';
    import { squares } from '../../stores';
    import { createEventDispatcher } from 'svelte';
  
    export let id;
  export let x;
  export let y;
  export let width;
  export let height;

  let dragging = false;
  let resizing = false;
  let offsetX, offsetY;

  const dispatch = createEventDispatcher();

  // Dragging Functions
  function startDrag(event) {
    if (event.button !== 0) return;

    dragging = true;
    offsetX = event.clientX - x * 50;
    offsetY = event.clientY - y * 50;

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  }

  function doDrag(event) {
    if (!dragging) return;

    let newX = event.clientX - offsetX;
    let newY = event.clientY - offsetY;

    newX = Math.round(newX / 50);
    newY = Math.round(newY / 50);

    squares.update(sqs =>
      sqs.map(sq => sq.id === id ? {...sq, x: newX, y: newY} : sq)
    );

    dispatch('move', { id, x, y, width, height });
  }

  function stopDrag() {
    dragging = false;
    window.removeEventListener('mousemove', doDrag);
    window.removeEventListener('mouseup', stopDrag);
    
  }

  // Resizing Functions
  function startResize(event) {
    if (event.button !== 0) return;

    resizing = true;
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = width;
    const startHeight = height;

    function doResize(moveEvent) {
      if (!resizing) return;

      let currentWidth = Math.max(1, startWidth + (moveEvent.clientX - startX) / 50);
      let currentHeight = Math.max(1, startHeight + (moveEvent.clientY - startY) / 50);

      currentWidth = Math.round(currentWidth);
      currentHeight = Math.round(currentHeight);

      squares.update(sqs =>
        sqs.map(sq => sq.id === id ? {...sq, width: currentWidth, height: currentHeight} : sq)
      );
      dispatch('resize', { id });
    }

    function stopResize() {
      resizing = false;
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
      
    }

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }
</script>

<div class="square"
     style="left: {x * 50}px; top: {y * 50}px; width: {width * 50}px; height: {height * 50}px;">
  <div class="drag-handle" on:mousedown={startDrag}></div>
  <div class="resize-handle" on:mousedown={startResize}></div>
</div>

<style>
  .square {
    position: absolute;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    box-sizing: border-box;
    overflow: hidden;
  }
  .drag-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 20px; /* Adjust the size as needed */
    cursor: move;
    background-color: rgba(0,0,0,0.1); /* Slightly darkened area to indicate draggable zone */
  }
  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 20px; /* Adjust the size as needed */
    height: 20px;
    cursor: nwse-resize;
    background-color: rgba(0,0,0,0.2); /* More darkened to distinguish from drag handle */
  }
</style>