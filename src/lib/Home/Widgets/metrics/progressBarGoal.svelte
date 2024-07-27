<script>



    import { onMount } from 'svelte';

    export let progress = 0;
  export let target = 0;
  export let hastarget = false;

  $: progressWidth = `${Math.min(progress, target)}%`;
  $: targetWidth = progress < target ? `${target - progress}%` : `${progress - target}%`;
  $: leftCircle = '0%'; // Set initial position to 0%
  $: tooltip = progress < target ? `${target - 2.3}%` : `${target - 2.3}%`;
  $: percentage =
    progress < target ? ((target - progress) / target) * 100 : ((progress - target) / progress) * 100;
  $: isEqual = !hastarget;

  onMount(() => {
    setTimeout(() => {
      leftCircle = progress < target ? `${progress - 2.3}%` : `${progress - 2.3}%`;
    }, 100); // Delay to trigger the transition
  });
</script>

<div class="w-full px-5">
  <div class="{`progress-bar ${isEqual ? 'bg-blue-300' : progress < target ? 'bg-red-300' : 'bg-green-300'}`}">
    <div
      id="progress"
      class="{`progress ${isEqual ? 'bg-blue-800' : progress < target ? 'bg-red-800' : 'bg-green-800'}`}"
      style="width: {progressWidth}"
    ></div>

    <div
      id="target-zone"
      class="{`${isEqual ? 'target-zone-blue' : progress < target ? 'target-zone-red' : 'target-zone-green'}`}"
      style="width: {targetWidth}"
    ></div>
    <div
      id="circle"
      class="{`circle ${isEqual ? 'bg-blue-800' : progress < target ? 'bg-red-800' : 'bg-green-800'}`}"
      style="left: {leftCircle}"
    ></div>
  </div>
</div>
<div class="ml-3 mt-2">
  {#if !isEqual}
    <h2 class="text-sm text-gray-400 ml-2 mr-2">
      <span class="{progress < target ? 'text-red-800' : 'text-green-800'}">
        <strong>{Math.round(percentage)}</strong>% {progress < target ? "behind schedule" : "Ahead of schedule"}
      </span>
      and should finish on <strong>Jun 12</strong> instead of Jun 30
    </h2>
  {:else}
    <h2 class="text-sm text-gray-400 ml-2 mr-2"> 6% of progress this month</h2>
  {/if}
</div>

<style>
  .progress-bar {
    height: 12px;
    position: relative;
    display: flex;
    width: 100%;
    border-radius: 25px;
    overflow: visible;
  }
  .progress {
    text-align: center;
    height: 12px;
    margin-left: -1px;
    color: white;
    border-radius: 24px 0px 0px 24px;
    transition: width 0.5s ease-in-out; /* Add transition for animation */
  }
  .target-zone-green {
    position: relative;
    background: repeating-linear-gradient(
      135deg,
      rgb(34 197 94),
      rgb(34 197 94) 2px,
      transparent 2px,
      transparent 4px
    );
    border-radius: 0px 24px 24px 0px;
  }
  .target-zone-red {
    position: relative;
    background: repeating-linear-gradient(
      135deg,
      rgb(239 68 68),
      rgb(239 68 68),
      2px,
      transparent 2px,
      transparent 4px
    );
    border-radius: 0px 24px 24px 0px;
  }

  .circle {
    position: absolute;
    top: -4px; /* To center the circle vertically */
    width: 22px; /* Wider than the bar */
    height: 22px; /* Wider than the bar */
    border: 4px solid rgb(183, 186, 189);
    border-radius: 50%;
    transition: left 0.5s ease-in-out; /* Add transition for animation */
  }
</style>