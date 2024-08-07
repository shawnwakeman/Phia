<script lang="ts">
    import type { GridItemType } from "../../../types/collection";
    export let item: GridItemType;
	import * as Dialog from "$lib/components/ui/dialog";
	import { Switch } from "$lib/components/ui/switch";
	import { Slider } from "$lib/components/ui/slider";
	import { Label } from "$lib/components/ui/label";
	import { Separator } from "$lib/components/ui/separator";
	import * as Select from "$lib/components/ui/select";
	import { Input } from "$lib/components/ui/input";
	import Clock from "./Clock.svelte";
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
    import { Button } from "$lib/components/ui/button/index.js";


import { Settings } from 'lucide-svelte'


	let animating = false;

	let count = 0;
	let currentIndex = 0;
	let step = 1;
	let isPaused = false;
	let autoplay = true;
	let autoplayForWork = true;
	let totalCyclesCompleted = 0;
	let totalTime = 0;
	let longBreakInterval = 4;
	let dailyScheduledTime = 3600 * 6; // 6 hours in seconds

	let translate = 0;

    
	let timer;

	let phases = [
		{ name: "Work Time", duration: 5 },
		{ name: "Short Break", duration: 5 * 60 },
		{ name: "Long Break", duration: 60 * 60 },
	];

	let currentPhase = phases[currentIndex].name;

	function startTimer(duration: number) {
		clearInterval(timer);
		count = duration;
		timer = setInterval(function () {
			if (!autoplayForWork && currentPhase === "Work Time") return;
			if (!autoplay && currentPhase !== "Work Time") return;
			count -= step;
			totalTime += step;
			if (isPaused) return;

			if (count === 0) {
				clearInterval(timer);
				if (autoplay) {
					moveToNextPhase();
				}
			}
		}, 1000);
	}

	function moveToNextPhase() {
		if (currentIndex === 2) {
			currentIndex = 0;
		} else {
			// Increment the counter every time "Work Time" is completed
			if (currentIndex === 0) {
				totalCyclesCompleted += 1;
			}

			// Determine if it's time for a long break
			let isTimeForLongBreak =
				totalCyclesCompleted % longBreakInterval === 0 && currentIndex === 0;

			if (isTimeForLongBreak) {
				// It's time for a "Long Break"
				currentIndex = 2; // Move directly to "Long Break"
			} else {
				// Normal cycle between "Work Time" and "Short Break"
				currentIndex = (currentIndex + 1) % 2; // This ensures we alternate between 0 and 1
			}
		}

		currentPhase = phases[currentIndex].name;

		startTimer(phases[currentIndex].duration);
		console.log(`Starting ${phases[currentIndex].name}`);
	}

	function changePhase(index: number) {
		clearInterval(timer);
		currentIndex = index;
		currentPhase = phases[currentIndex].name;
		if (currentIndex === 0) {
			translate = 0;
		} else if (currentIndex === 1) {
			translate = 93;
		} else {
			translate = 189;
		}
		startTimer(phases[currentIndex].duration);
	}

	startTimer(phases[currentIndex].duration);

	function toggleStep() {
		if (step === 1) {
			step = 0;
			isPaused = true;
		} else {
			step = 1;
			isPaused = false;
		}
	}

	function toggleAutoplay() {
		autoplay = !autoplay;
	}

	function toggleAutoplayWork() {
		autoplayForWork = !autoplayForWork;
	}

	function resetTimer() {
		clearInterval(timer);
		count = phases[0].duration;
		currentIndex = 0;
		totalCyclesCompleted = 0;
		totalTime = 0;
		currentPhase = phases[currentIndex].name;
		startTimer(count);
	}

	function updatePhaseDuration(index: number, value: number) {
		phases[index].duration = value * 60; // Convert minutes to seconds for consistency
		if (currentIndex === index) {
			// Reset the timer only if the current phase's duration is being updated
			startTimer(phases[currentIndex].duration);
		}
	}

	function handleIntervalChange(event) {
		longBreakInterval = parseInt(event.target.value);
	}

	$: filledDotsCount = totalCyclesCompleted % longBreakInterval;
	$: filledDots = Array(filledDotsCount).fill("filled");
	$: emptyDots = Array(longBreakInterval - filledDotsCount).fill("empty");
</script>

<div class="container flex items-center justify-items-center flex-col">
	<h3 class="text-2xl font-bold mt-1">Foucs Timer</h3>

	<div class="flex flex-col items-center w-full mt-10">
		<div class="">
			{#each filledDots as dot}
				<span class="dot filled"></span>
			{/each}
			{#each emptyDots as dot}
				<span class="dot"></span>
			{/each}
		</div>

		<div class="button-container w-full grow">
			<div class="capsule-container">
				<div class="slider" style="transform: translateX({currentIndex * 100}%);"></div>
				{#each phases as phase, index}
					<div
						class="phase {index === currentIndex ? 'current' : ''}"
						on:click="{() => changePhase(index)}"
					>
						{phase.name}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- export let cont: number;
    export let duration: number;
    export let totalCyclesCompleted: number;
    export let totalTime: number;
    export let isPaused: boolean;
    export let resetTimer: () => void;
    export let toggleStep: () => void;
    export let moveToNextPhase: () => void; -->
    <div class="h-20">

    </div>
	<Clock
		cont="{count}"
		phase="{phases[currentIndex]}"
		{totalCyclesCompleted}
		{totalTime}
		{isPaused}
		{resetTimer}
        {toggleStep}
        {moveToNextPhase}
	/>
    <div class="h-20">

    </div>

    <div class="grow flex flex-col justify-end ">
		<Dialog.Root>
			<Dialog.Trigger>
                <Button
                variant="outline"
                size="icon"
                class="bg-transparent border-none group p-0 mb-5"
                on:click="{moveToNextPhase}"
            >
                <Settings class="w-6 h-6 text-current group-hover:text-highlight-color" />
            </Button>
                
                </Dialog.Trigger>
			<Dialog.Content class="max-w-lg max-h-[90dvh] overflow-y-auto overflow-x-hidden">
				<Dialog.Header>
					<Dialog.Title class="text-3xl pb-2">Pomodoro Settings</Dialog.Title>
					<Separator />
				</Dialog.Header>
				<h2 class="text-2xl font-bold">Timer</h2>

				<h3 class="text-lg font-bold">Phase Times</h3>
				<div class="flex">
					<div class="flex-1 mx-5">
						<Label for="work-time-length">Work Time</Label>
						<div class="input-container" id="work-time-length">
							<input
								type="number"
								class="custom-number-input"
								max="60"
								min="0"
								step="0"
								value="30"
							/>
							<span class="input-label">min</span>
						</div>
					</div>
					<div class="flex-1 mx-5">
						<Label for="short-break-time">Short Break</Label>
						<div class="input-container" id="short-break-time">
							<input
								type="number"
								class="custom-number-input"
								max="60"
								min="0"
								step="0"
								value="5"
							/>
							<span class="input-label">min</span>
						</div>
					</div>
					<div class="flex-1 mx-5">
						<Label for="terms">Long Break</Label>
						<div class="input-container" id="long-break-time">
							<input
								type="number"
								class="custom-number-input"
								max="60"
								min="0"
								step="0"
								value="15"
							/>
							<span class="input-label">min</span>
						</div>
					</div>
				</div>
				<Separator />
				<div>
					<div class="flex items-center my-4">
						<Label for="autoStartBreaks" class="flex-1 text-lg">Auto Start Breaks</Label
						>
						<Switch id="autoStartBreaks" />
					</div>

					<div class="flex items-center my-4">
						<Label for="autoStartWorkTime" class="flex-1 text-lg"
							>Auto Start Work Time</Label
						>
						<Switch id="autoStartWorkTime" />
					</div>
				</div>

				<div>
					<div class="flex items-center my-4">
						<Label for="shortBreaks" class="flex-1 text-lg">Short Breaks</Label>
						<Switch id="shortBreaks" />
					</div>

					<div class="flex items-center my-4">
						<Label for="longBreaks" class="flex-1 text-lg">Long Breaks</Label>
						<Switch id="longBreaks" />
					</div>
				</div>
				<Separator />
				<div class="flex items-center">
					<h3 class="flex-1 text-2xl font-bold">Alert Sound</h3>

					<Select.Root>
						<Select.Trigger class="w-[180px]">
							<Select.Value placeholder="Sound" />
						</Select.Trigger>

						<Select.Content>
							<Select.Item value="light">Light</Select.Item>
							<Select.Item value="dark">Dark</Select.Item>
							<Select.Item value="system">System</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<Label for="terms">Volume</Label>

					<Slider value="{[33]}" max="{100}" step="{1}" />
				</div>
				<Separator />

				<h3 class="flex-1 text-2xl font-bold">Display Options</h3>

				<div class="flex items-center my-0.5">
					<Label for="longBreaks" class="flex-1 text-lg">Focus Statment</Label>
					<Switch id="longBreaks" />
				</div>
				<div class="flex items-center my-0.5">
					<Label for="longBreaks" class="flex-1 text-lg">Completed Work Phases</Label>
					<Switch id="longBreaks" />
				</div>
				<div class="flex items-center my-0.5">
					<Label for="longBreaks" class="flex-1 text-lg">Total Time</Label>
					<Switch id="longBreaks" />
				</div>
				<div class="flex items-center my-0.5">
					<Label for="longBreaks" class="flex-1 text-lg">Work Phase Tally</Label>
					<Switch id="longBreaks" />
				</div>

				<Separator />

				<h3 class="text-2xl font-bold">reminder</h3>
				<div class="flex items-center">
					<Select.Root>
						<Select.Trigger class="w-[90px] mr-3">
							<Select.Value placeholder="Last" />
						</Select.Trigger>

						<Select.Content>
							<Select.Item value="light">Light</Select.Item>
							<Select.Item value="dark">Dark</Select.Item>
							<Select.Item value="system">System</Select.Item>
						</Select.Content>
					</Select.Root>
					<Select.Root>
						<Select.Trigger class="w-[90px]">
							<Select.Value placeholder="5" />
						</Select.Trigger>

						<Select.Content>
							<Select.Item value="light">Light</Select.Item>
							<Select.Item value="dark">Dark</Select.Item>
							<Select.Item value="system">System</Select.Item>
						</Select.Content>
					</Select.Root>

					<p class="input-label ml-2">min</p>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
	}
	.active {
		background-color: red;
	}
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

	input[type="number"]::-webkit-outer-spin-button,
	input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type="number"] {
		-moz-appearance: textfield; /* Hide the arrows in Firefox */
	}

	.input-container {
		display: flex;
		align-items: center;
		border: 1px solid rgb(53, 53, 53); /* Border around the entire container */
		padding: 5px;
		border-radius: 8px;
		background-color: black; /* Background color for the entire container */
	}

	.input-container:focus-within {
		border: 1px solid white; /* Change border color when the input is focused */
	}

	.custom-number-input {
		background-color: black;
		color: white;
		font-size: 18px; /* Bigger number */
		border: none; /* Remove default input border */
		margin-left: 5px;
		flex-grow: 1;
		padding-right: 5px;
		outline: none; /* Remove default outline */
	}

	.input-label {
		color: darkgrey;
		font-size: 14px;
		line-height: 24px; /* Match the font size of the number input */
		margin-right: 5px;
	}

	.button-container {
		background-color: #a8a8a8;
		width: 100%;
		min-width: 250px;
        max-width: 400px;
		padding: 5px;
		border-radius: 100px;
	}

	.capsule-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 45px;

		width: 100%;
		overflow: hidden;
		position: relative;
	}

	.slider {
		position: absolute;
		top: 0;
		bottom: 0;
		width: calc(100% / 3);
		background-color: red;
		border-radius: 50px;
		transition: transform 0.5s ease-in-out;
		z-index: 0;
	}

	.phase {
		flex: 1;
		text-align: center;
		border-radius: 25px;
		position: relative;
		z-index: 1;
	}


</style>
