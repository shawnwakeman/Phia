<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    let count = 0;
    let currentIndex = 0; 
    let step = 1;
    let isPaused = false
    let autoplay = true
    let totalCyclesCompleted = 0;
    let totalTime = 0;
    let longBreakInterval = 4;
    let dailyScheduledTime = 3600 * 6; // 6 hours in seconds
    let timer; 
    let phases = [
        { name: "Work Time", duration: 30 * 60 },
        { name: "Short Break", duration: 5 * 60 },
        { name: "Long Break", duration: 60 * 60 }
    ];


    function startTimer(duration: number) {
        clearInterval(timer);
        count = duration;
        timer = setInterval(function() {
            count -= step;
            totalTime += step
            if (isPaused) return;
            if (count === 0 && autoplay === true) {
                clearInterval(timer);
                
                // Move to the next timer phase
                moveToNextPhase();
            } else if (count === 0 && autoplay === false) {
                clearInterval(timer);
                
                // Move to the next timer phase
                
                moveToNextPhase();
                toggleStep();
            }
        }, 1000); // Adjust the interval as needed
    }




    function moveToNextPhase() {
        // If we just finished a "Long Break", reset for the next cycle
        if (currentIndex === 2) {
            currentIndex = 0; // Start the cycle over with "Work Time"

        } else {
            // Increment the counter every time "Work Time" is completed
            if (currentIndex === 0) {
                totalCyclesCompleted += 1;
            }

            // Determine if it's time for a long break
            let isTimeForLongBreak = totalCyclesCompleted % longBreakInterval === 0 && currentIndex === 0;

            if (isTimeForLongBreak) {
                // It's time for a "Long Break"
                currentIndex = 2; // Move directly to "Long Break"
            } else {
                // Normal cycle between "Work Time" and "Short Break"
                currentIndex = (currentIndex + 1) % 2; // This ensures we alternate between 0 and 1
            }
        }

        // Start the next timer phase
        startTimer(phases[currentIndex].duration);
        console.log(`Starting ${phases[currentIndex].name}`);
    }




    startTimer(phases[currentIndex].duration);

    function toggleStep() {
        if (step === 1) {
            step = 0;
            isPaused = true
        } else {
            step = 1
            isPaused = false
        }
    }

    function toggleAutoplay() {
        autoplay = !autoplay;
    }

    function resetTimer() {
        clearInterval(timer); // Clear the current timer
        count = phases[0].duration; // Reset count to the current phase's duration
        currentIndex = 0
        totalCyclesCompleted = 0
        totalTime = 0
        // Optionally reset total cycles completed if needed
        startTimer(count); // Restart the timer with the new count
    }

    function updatePhaseDuration(index: number, value: number) {
        phases[index].duration = value * 60; // Convert minutes to seconds for consistency
            if (currentIndex === index) {
            // Reset the timer only if the current phase's duration is being updated
            startTimer(phases[currentIndex].duration);
            }
    }








    const svgWidth = 600, svgHeight = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;




    function handleIntervalChange(event) {
    longBreakInterval = parseInt(event.target.value);
    // Optionally reset totalCyclesCompleted if needed
    // totalCyclesCompleted = 0;
    }





    // Your D3 code here
        // This code now runs only in the browser, preventing server-side document errors

    // Append the SVG object to the body of the page





    $: filledDotsCount = (totalCyclesCompleted % longBreakInterval);
    $: filledDots = Array(filledDotsCount).fill('filled');
    $: emptyDots = Array(longBreakInterval - filledDotsCount).fill('empty');

</script>

<svg id="myD3Graph"></svg>
<div>
    {#each phases as phase, index}
      <div>
        <label>{phase.name}: {phase.duration / 60} minutes</label>
        <input type="range" min="1" max="60" value={phase.duration / 60} on:input={(e) => updatePhaseDuration(index, +e.target.value)} />
      </div>
    {/each}
  </div>

  
  <label for="interval-slider">Long Break Interval: {longBreakInterval}</label>

  <input
  type="range"
  id="interval-slider"
  min="1"
  max="10"
  value={longBreakInterval}
  on:change={handleIntervalChange}
/>

  <div>
    <button on:click={() => toggleAutoplay()}>Toggle Autoplay</button>
    <button on:click={() => moveToNextPhase()}>Skip</button>
    <button on:click={() => toggleStep()}>{isPaused ? 'Start' : 'Pause'}</button>
    <button on:click={resetTimer}>Reset</button>
  </div>
  
  <h2>Time Left: {Math.floor(count / 60)}:{('0' + count % 60).slice(-2)}</h2>
  <h2>Total Cycles Completed: {totalCyclesCompleted}</h2>
  <h2>Total Time Completed: {totalTime} minutes</h2>

  <div>
    {#each filledDots as dot}
      <span class="dot filled"></span>
    {/each}
    {#each emptyDots as dot}
      <span class="dot"></span>
    {/each}
  </div>


  <style>
    .dot {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin: 2px;
      border-radius: 50%;
      background-color: #ccc;
    }
    .filled {
      background-color: #555;
    }
  </style>
  