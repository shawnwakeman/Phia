<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
	export let item;
	import { fade } from "svelte/transition";

	let portfolio;
	let chartInstance;

	let delayed;
	let canvasWidth;
	let canvasHeight;

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
				backgroundColor: ["#2563eb"],
				borderWidth: 2,
				borderRadius: 10,
				borderSkipped: false,
			},
		],
	};

	const config = {
		type: "bar",
		data: data,

		options: {
			maintainAspectRatio: false,

			borderRadius: 12,
			cutout: "75%",
			spacing: 2,
			scales: {
				x: {
					grid: {
						display: false,
					},

					border: {
						display: false,
					},
				},
				y: {
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

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
		// Clean up the observer when the component is destroyed
	});
</script>

<div class="td">
	<h1 class="font-bold text-lg ml-4 mr-2 mt-12">Trending up by 5.2% this</h1>
	<h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2">January - June 2024 or Issues vs. States</h2>

	<div class="chart-container" style="position: relative;">
		<canvas bind:this="{portfolio}"></canvas>
	</div>

	<div class="text-container">
		<h1 class="font-medium ml-4 mt-4 mr-2">Trending up by 5.2% this month</h1>
		<h2 class="text-sm text-gray-400 ml-4 mt-1 mb-6">
			January - June 2024 or Issues vs. States
		</h2>
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
