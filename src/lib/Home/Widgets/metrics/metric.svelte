<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
    import ProgressBarGoal from "./progressBarGoal.svelte";
 
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

function randomize() {
    isSimple = Math.random() < 0.5;
    console.log("isSimple:", isSimple);
}

// Call randomize function to set the initial value
randomize();

</script>


{#if isSimple}
<div class="td">
	<div class="text-container mt-2">
		<div>
			<h2 class="text-sm text-gray-400 ml-2 mr-2">State Completion</h2>
			<h1 class="font-bold text-3xl ml-2 mt-1 mr-2">16%</h1>
		</div>
	</div>
    <div class="w-full mb-2">
        <ProgressBarGoal progress={16} target={50} hastarget={true}/>
    </div>

	
</div>
{:else}
<div class="td">

	<div class="text-container mt-2">
        <h2 class="top-text">down 5.6% last week</h2>
		<div>
			
			<h1 class="font-bold text-4xl ml-2 mt-1 mr-2">43 min</h1>
            <h2 class="text-sm text-gray-400 ml-2 mr-2">Avg issue completion time</h2>
		</div>
	</div>
    
   
	
</div>
{/if}





<style>
	.td {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
        justify-content: flex-end;
		height: 100%;
		padding-top: 40px;
	}

    .top-text {
        position: absolute;
        top: 0;
        right: 0;
        margin-right: 10px;
        margin-top: 40px;
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
		margin: 0 1rem 1rem 1rem;
		z-index: 0;
	}
</style>

