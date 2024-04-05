<!-- Grid.svelte -->
<script>
    import { onMount } from 'svelte';
    import Square from './Square.svelte';
    import { squares } from '../../stores';
  

  let gridWidth = '100%'; // Responsive width
  let gridColumns = 10; // Define how many columns the grid has
  let gridSize = 50; // Size of the grid unit in pixels

  // Recalculate grid layout on window resize
  onMount(() => {
    function resizeGrid() {
      // Example: adjust gridSize based on the container width or similar logic
      // This is a placeholder for responsive grid logic
    }

    window.addEventListener('resize', resizeGrid);
    return () => {
      window.removeEventListener('resize', resizeGrid);
    };
  });

  let lastMovedSquare = { id: null, index: -1, square: null };

function handleMove(event) {
  // Extracting the details of the moved square
  const { id, newX, newY, width, height } = event.detail;

  squares.subscribe((allSquares) => {
    // Check if the last moved square is the same as the current one
    if (lastMovedSquare.id !== id) {
      // If not, find the square and update the lastMovedSquare cache
      const squareIndex = allSquares.findIndex(sq => sq.id === id);
      if (squareIndex === -1) {
        console.log("Moved square not found.");
        return; // Exit if the moved square is not found
      }
      lastMovedSquare = {
        id,
        index: squareIndex,
        square: allSquares[squareIndex - 1]
      };
    }

    // Update the position for overlap checks without altering the original square
    const movedSquare = { ...lastMovedSquare.square, x: newX, y: newY };

    // Initialize an array to keep track of any squares that overlap with the moved square
    const overlappingSquares = allSquares.reduce((acc, sq, index) => {
      if (index !== lastMovedSquare.index && checkOverlap(movedSquare, sq)) {
        acc.push(sq.id); // Add the ID of the overlapping square
      }
      return acc;
    }, []);
    
    // Log the results
    if (overlappingSquares.length > 0) {
      console.log(`Square ${id} at new position (${newX}, ${newY}) overlaps with square(s) ${overlappingSquares.join(', ')}`);
    }
  });

  console.log(`Square ${id} at new position (${newX}, ${newY}) overlaps with square(s) ${overlappingSquares.join(', ')}`);
}

  function handleResize(event) {
    const { id, newX, newY, width, height } = event.detail;
  console.log(`Square ${id} resized`, newX);


}

function checkAndResolveOverlaps(sqs, resizedSquare) {
  let overlapOccurred = false;

  sqs.forEach(sq => {
    if (sq.id !== resizedSquare.id && checkOverlap(resizedSquare, sq)) {
      // Move sq to avoid overlap
      moveSquare(sqs, sq, resizedSquare);
      overlapOccurred = true;
    }
  });

  return overlapOccurred;
}

function checkOverlap(squareA, squareB) {
  // Check if two squares overlap
  return squareA.x < squareB.x + squareB.width &&
         squareA.x + squareA.width > squareB.x &&
         squareA.y < squareB.y + squareB.height &&
         squareA.y + squareA.height > squareB.y;
}

function moveSquare(squares, squareToMove, referenceSquare) {
  // Implement the logic to find a new position for squareToMove
  // This example simply moves the square to the right but consider more sophisticated logic
  squareToMove.x = referenceSquare.x + referenceSquare.width;
  // Ensure it stays within grid bounds, etc.
}


</script>

<style>
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
      gap: 10px;
      width: 100%;
    }
  </style>

<div class="grid" style="--grid-width: {gridWidth}; --grid-columns: {gridColumns};">
  {#each $squares as square (square.id)}
  <Square {...square} on:move={handleMove} on:resize={handleResize} />
  {/each}
</div>