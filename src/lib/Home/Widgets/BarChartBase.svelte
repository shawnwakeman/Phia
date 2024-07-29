<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
   
	export let item;
	import { fade, slide } from "svelte/transition";
	import { TrendingUpIcon } from "lucide-svelte";

	let portfolio;
	let chartInstance;

	let delayed;
	let canvasWidth;
	let canvasHeight;

	let container;

	let showingViz = true;
	let showingName = true;

	let isCanvasSmall = false;
	let isStacked = false;
	let isHorizontal = false;
	let showBottomText = true;

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

		options: {
			responsive: false,
			maintainAspectRatio: false,
			indexAxis: isHorizontal ? "y" : "x",
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

	onMount(() => {
		const ctx = portfolio.getContext("2d");
		chartInstance = new Chart(ctx, config);

		const updateCanvasSize = () => {
			showingViz = container.clientWidth >= 200 && container.clientHeight >= 250;
			showingName = container.clientWidth >= 110;

			if (chartInstance) {
				chartInstance.resize();
				chartInstance.render();
			}
            else {
                console.log("no chart instance");
            }
		};

		const resizeObserver = new ResizeObserver(() => {
			updateCanvasSize();
		});

		const handleMouseUp = () => {
			updateCanvasSize();
		};

		resizeObserver.observe(container);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			if (chartInstance) chartInstance.destroy();
			resizeObserver.disconnect();
			window.removeEventListener("mouseup", handleMouseUp);
		};
	});
</script>

<div class="td" bind:this="{container}">
	{#if showingName}
        <h1
        class="pl-2 text-slate-500 p-1 m-1 mr-16 text-base line-clamp-1 absolute left-0 top-0"
            style="pointer-events: none;"
        >
            {item.type.windowName}
        </h1>
	{/if}
	<div>
		<h1 class="font-bold text-lg ml-4 mr-2 mt-12 overflow-hidden line-clamp-1">
			{item.type.header}
		</h1>

		{#if showingViz}
			<h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2 mb-2">
				{item.type.description}
			</h2>
		{/if}
	</div>

	<div class="chart-container" style="position: relative;">
		<canvas bind:this="{portfolio}"></canvas>

	</div>

	<div>
		{#if showingViz}
			<h1 class="font-medium ml-4 mt-2 mr-2 mb-3">Trending up by 5.2% this month</h1>
		{/if}
	</div>
</div>

<style>
	.td {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.chart-container {
		flex-grow: 5;
		display: flex;
		overflow: hidden;
		margin: 1rem 1rem 0rem 1rem;
	}
</style>
