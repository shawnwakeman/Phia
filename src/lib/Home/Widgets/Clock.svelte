<script lang="ts">
	export let cont: number;
	export let phase: { name: string; duration: number };
	export let totalCyclesCompleted: number;
	export let totalTime: number;
	export let isPaused: boolean;
	export let resetTimer: () => void;
	export let toggleStep: () => void;
	export let moveToNextPhase: () => void;
	import { TimerReset, Pause, Play, SkipForward, Clock } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	let radius = 200;

	const phases = [
		{ name: "Work Time", color: "#ff0000" },
		{ name: "Short Break", color: "#00ff00" },
		{ name: "Long Break", color: "#0000ff" },
	];

	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600) ;
		const minutes = Math.floor((seconds % 3600) / 60);

		if (hours > 0) {
			return `${hours} h ${minutes} m`;
		} else {
			return `${minutes} m`;
		}
	}

	const formattedTime = formatTime(totalTime);

	$: strokeDasharray = 2 * Math.PI * (radius - 10);
	$: strokeDashoffset = strokeDasharray - (strokeDasharray * (cont - 1)) / phase.duration; // Adjusted for the final second
	$: currentColor = phases.find((p) => p.name === phase.name)?.color || "#ff0000";
</script>

<div class="timer" style=" min-width: 300px; min-height: 300px max-width: 500px; max-height: 500px; height: 100%;">
	<svg viewBox="0 0 {radius * 2} {radius * 2}" width="100%" height="100%">
		<circle cx="{radius}" cy="{radius}" r="{radius - 10}" class="circle background"></circle>
		<circle
			cx="{radius}"
			cy="{radius}"
			r="{radius - 10}"
			class="circle foreground"
			stroke="{currentColor}"
			stroke-dasharray="{strokeDasharray}"
			stroke-dashoffset="{strokeDashoffset}"
		></circle>
	</svg>
    <div class="clock grow">
        <div class="flex">
            <h2 class="grow text-left ml-2">#{totalCyclesCompleted}</h2>
            <div class="flex items-center mr-2">
                <Clock class="w-4 h-4 mr-1"/>
                <h2 class="grow">{formattedTime}</h2>
            </div>
        </div>
    
        <p class="countdown font-bold">
            <span class="countdown-number" id="minutes">
                {Math.floor(cont / 60)}:{cont % 60 < 10 ? "0" : ""}{cont % 60}
            </span>
        </p>
        <div class="grow mt-5">
            <Button
                variant="outline"
                size="icon"
                class="bg-transparent border-none group p-0 m-0"
                on:click="{resetTimer}"
            >
                <TimerReset class="w-6 h-6 text-current group-hover:text-highlight-color" />
            </Button>
    
            <Button
                variant="outline"
                size="icon"
                class="bg-transparent border-none group p-0 m-0"
                on:click="{toggleStep}"
            >
                {#if isPaused}
                    <Play class="w-6 h-6 text-current group-hover:text-highlight-color" />
                {:else}
                    <Pause class="w-6 h-6 text-current group-hover:text-highlight-color" />
                {/if}
            </Button>
    
            <Button
                variant="outline"
                size="icon"
                class="bg-transparent border-none group p-0 m-0"
                on:click="{moveToNextPhase}"
            >
                <SkipForward class="w-6 h-6 text-current group-hover:text-highlight-color" />
            </Button>
        </div>
    </div>
</div>

<!-- <Button
					variant="outline"
					size="icon"
					class="bg-transparent border-none group p-0 m-0"
					on:click="{() => setCurrentView('treemap')}"
				>
					<Network
						class="w-4 h-4 text-current group-hover:text-highlight-color"
					/>
				</Button> -->

<style>
	.circle {
		fill: none;
		stroke-width: 10;
		stroke-linecap: round;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
     
	}

	.foreground {
		transition:
			stroke-dashoffset 0.3s ease,
			stroke 0.5s ease-in-out;
	}

	.clock {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}
	.timer {
		position: relative;
		display: inline-block;
        overflow: hidden;
	}
	.grow {
		font-size: 14px;
	}

	.countdown {
		font-size: 4.75rem; /* 72px */
		line-height: 1;

	}

 
    

</style>
