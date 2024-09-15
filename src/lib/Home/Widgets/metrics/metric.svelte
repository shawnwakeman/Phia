<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
    import ProgressBarGoal from "./progressBarGoal.svelte";
    import { TrendingUp } from 'lucide-svelte';
	export let item;
	import { fade } from "svelte/transition";

	let portfolio;
	let chartInstance;

	let delayed;
	let canvasWidth;
	let canvasHeight;

	let container;

	let isStacked = false;
	let isHorizontal = false;

    let showingViz = true;
	let showingName = true;
    let showingDes = true;
	const getDynamicMax = (data) => {
		const maxDataValue = Math.max(...data.datasets[0].data);
		return maxDataValue * 1.1; // Extend the max value by 20%
	};

	const data = {
		labels: [
			"Expenses",
			"Savings",
			"in need",
			"Expenses",
			"Savings",
			"Investments",
			"Expenses",
			"Savings",
			"Investments",
		],
		datasets: [
			{
				data: [300, 50, 100, 123, 1425, 123, 123, 463, 123],
				backgroundColor: (context) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
					gradient.addColorStop(0, "rgb(49, 110, 200)");
					gradient.addColorStop(1, "rgba(24, 59, 157)");
					return gradient;
				},
				// borderWidth: 1,
				borderRadius: 6,
				borderSkipped: isStacked ? "middle" : false,
			},
			{
				data: [123, 12, 24, 124, 124, 124, 124, 124, 124],
				backgroundColor: ["#e263eb"],
				borderColor: "rgba(0, 0, 0, 0.3)",
				// borderWidth: 1,
				borderRadius: 6,
				borderSkipped: isStacked ? "middle" : false,
			},
		],
	};

	const config = {
		type: "bar",
		data: data,

		onResize: () => {
			console.log("Resizing chart");
		},
		options: {
			responsive: false,
			maintainAspectRatio: false,
			indexAxis: isHorizontal ? "y" : "x",
			onresize: console.log("ads"),
			scales: {
				x: {
					grid: {
						display: false,
					},

					border: {
						display: false,
					},
					stacked: isStacked,
				},
				y: {
					stacked: isStacked,
					beginAtZero: true,
					ticks: {
						beginAtZero: false,
					},
					grid: {
						drawBorder: false,
					},
					border: {
						display: false,
					},

					suggestedMax: getDynamicMax(data),
				},
			},
			legend: {
				display: false,
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					callbacks: {
						labelColor: function (context) {
							return {
								borderColor: "rgb(0, 0, 0)",
								backgroundColor: "#2563eb",
								borderWidth: 2,
							};
						},
						labelTextColor: function (context) {
							return "#A9A9A9";
						},
						label: function (context) {
							console.log(context);
							return " ".repeat(context.label.length * 1.5) + context.raw;
						},
					},
				},
			},
		},
	};


	let progress = 25;
	let target = 50;
	let hastarget = false;
    const daysAhead = 5; // Example days ahead
	$: progressWidth = `${Math.min(progress, target)}%`;
	$: targetWidth = progress < target ? `${target - progress}%` : `${progress - target}%`;
	$: leftCircle = progress < target ? `${progress - 2.3}%` : `${progress - 2.3}%`;
	$: tooltip = progress < target ? `${target - 2.3}%` : `${target - 2.3}%`;
	$: percentage =
		progress < target ? (target - progress) / target * 100 : (progress - target) / progress * 100;
	$: isEqual = !hastarget;
    let isSimple = false;



onMount(() => {
	

		const updateCanvasSize = () => {
            console.log(container.clientWidth, container.clientHeight);
			showingViz = container.clientWidth >= 220 && container.clientHeight >= 130;
			showingName = container.clientWidth >= 80;
            showingDes = container.clientWidth >= 150 || container.clientHeight >= 160;
	
		};

		const resizeObserver = new ResizeObserver(() => {
			updateCanvasSize();
		});

		
		resizeObserver.observe(container);
		

		return () => {
			
			resizeObserver.disconnect();
	
		};
	});

</script>


{#if isSimple}
<div class="td" bind:this="{container}">
	{#if showingName}
        <h1
        class="pl-2 text-slate-500 p-1 m-1 mr-8 text-base line-clamp-1 absolute left-0 top-0"
            style="pointer-events: none;"
        >
            {item.type.windowName}
        </h1>
	{/if}
	<div class="overflow-hidden">
        <div class="flex justify-between w-full px-2 ">

			<h2 class="text-sm text-gray-400 ml-2 flex items-end mb-1">State Completion</h2>
            <h1 class="font-bold text-3xl mt-1 mr-2 align-middle ">16%</h1>
		</div>

        <div class="w-full mb-2">
            <ProgressBarGoal progress={12} target={50} hastarget={true}/>
            {#if showingViz}
            <div class="ml-2 mt-2">
                {#if true}
                  <h2 class="text-sm text-gray-400 ml-2 mr-2 line-clamp-2">
                    <span class="{progress < target ? 'text-red-800' : 'text-green-800'}">
                      <strong>{Math.round(percentage)}</strong>% {progress < target ? "behind schedule" : "Ahead of schedule"}
                    </span>
                    and should finish on <strong>Jun 12</strong> instead of Jun 30
                  </h2>
                {:else}
                  <h2 class="text-sm text-gray-400 ml-2 mr-2"> 6% of progress this month</h2>
                {/if}
              </div>
            {/if}
           
        </div>

    </div>
		

	
</div>
{:else}
<div class="td" bind:this="{container}">

    {#if showingName}
        <h1
        class="pl-2 text-slate-500 p-1 m-1 mr-8 text-base line-clamp-1 absolute left-0 top-0"
            style="pointer-events: none;"
        >
            {item.type.windowName}
        </h1>
    {/if}
 
	<div class="text-container mt-2 mx-2 my-1 overflow-hidden">
    
        <h2 class="top-text line-clamp-1 ml-4 mr-4 flex items-center"><TrendingUp class="w-4 h-4 mr-1 align-middle justify-center" /> 5.6%</h2>
		<div>
			
			<h1 class="font-bold text-4xl ml-2 mt-1 mr-2 line-clamp-2">43 min</h1>
            {#if showingDes}
            <h2 class="text-sm text-gray-400 ml-2 mr-2line-clamp-2">Avg issue completion time</h2>
            {/if}
		</div>
	</div>
    
   
	
</div>
{/if}





<style>
	.td {
		display: flex;
		flex-direction: column;
		
        justify-content: flex-end;
		height: 100%;
		padding-top: 40px;
	}

    .top-text {
        position: absolute;
        top: 0;
        right: 0;
        margin-top: 35px;
        color: gray;
        font-size: 0.875rem;
    }

	

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
	.tooltip-container {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.tooltip-line {
		position: absolute;
		left: 9px;
		width: 2px;
		height: 25px;
		background: #333;
		margin: 0 auto;
	}
	.tooltip {
		top: 20px;
		left: -18px;

		background: #333;
		color: #fff;
		border-radius: 4px;
		font-size: 12px;
		white-space: nowrap;
		text-align: center;
	}

	.circle {
		position: absolute;
		top: -4px; /* To center the circle vertically */

		width: 22px; /* Wider than the bar */
		height: 22px; /* Wider than the bar */
		border: 4px solid rgb(183, 186, 189);
		border-radius: 50%;
	}

	.text-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		align-items: flex-start;
	
		z-index: 0;
	}
</style>

