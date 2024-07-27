<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";

	export let item;
	import { fade } from "svelte/transition";
    import { TrendingUp } from 'lucide-svelte';
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
    let string = ""
    let value = 134



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
				data: [300, 131, 100, 123, 100, 123, 123, 463, 123],
                backgroundColor: (context) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
                    gradient.addColorStop(0, "#90b7e2");
                    gradient.addColorStop(1, "#373B44");
					return gradient
				},
				// borderWidth: 1,
				borderRadius: 200,
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
			layout: {
				padding: 5,
			},
			scales: {
				x: {
					display: false,
					grid: {
						display: false,
					},

					border: {
						display: false,
					},
					stacked: isStacked,
				},
				y: {
					display: false,
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
                            string = "on May 10"
                            value = context.raw
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

        chartInstance.canvas.addEventListener('mouseleave', function() {
            string = "";
            value = 1245;
        });

		const updateCanvasSize = () => {
			chartInstance.resize();
		};

		const resizeObserver = new ResizeObserver(() => {
			updateCanvasSize();
		});

		// Start observing the div
		resizeObserver.observe(container);

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
			resizeObserver.disconnect();
		};
		// Clean up the observer when the component is destroyed
	});
</script>

<div class="td">
	<div class="text-container mt-2">
		<div>
			<h2 class="text-sm text-gray-400 ml-2 mr-2">Total Issues</h2>
      
			<h1 class="font-bold ml-2 mt-1 mr-2">{value}</h1>
            <h2 class="text-sm text-gray-400 ml-2 mr-2">{string}</h2>
		</div>

        <h2 class="text-sm text-gray-400 ml-2 mr-2 mb-4 flex"><TrendingUp class="w-4 h-4 mr-1 align-middle justify-center"/> 5.6%</h2>
	</div>
  
	<div class="chart-container" style="position: relative;" bind:this="{container}">
		<canvas class="mb-2 mr-2" bind:this="{portfolio}"></canvas>
		<div>&nbsp;</div>
	</div>
</div>



<style>
	.td {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		height: 100%;
        padding-top: 40px;
	}

    h1 {
        font-size: 2.3rem;
        line-height: 1;
    }

	.chart-container {
		overflow: hidden;
		height: 100%;
		width: 100%;
	}

	.text-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		align-items: flex-start;
		margin: 0 0rem 0rem 0.3rem;
        z-index: 0;
        min-width: 40%;
	}
</style>
