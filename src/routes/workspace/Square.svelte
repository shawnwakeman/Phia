<script lang="ts">
    let count = 0;
    let currentIndex = 0; 
    let step = 1;
    let isPaused = false
    let autoplay = true
    let totalCyclesCompleted = 0;
    let totalTime = 0;
    let timer; 
    let phases = [
        { name: "Work Time", duration: 5 },
        { name: "Short Break", duration: 8 },
        { name: "Long Break", duration: 10 }
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
        // Increment the current index, cycling back to 0 if it exceeds the length of the phases array
        currentIndex = (currentIndex + 1) % phases.length;


        if (currentIndex === 0) {
            totalCyclesCompleted += 1;
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






</script>

{count}
<h2>Total Cycles Completed: {totalCyclesCompleted}</h2>
<h2>Total time Completed: {totalTime}</h2>
<button on:click={() => toggleAutoplay()}>toggle step</button>


<button on:click={() => moveToNextPhase()}>skip</button>


<button on:click={() => toggleStep()}>
    {isPaused ? 'Start' : 'Pause'}
  </button>

  <button on:click={resetTimer}>Reset</button>