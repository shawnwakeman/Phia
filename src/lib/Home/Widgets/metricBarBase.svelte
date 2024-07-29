<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";

	export let item;
	import { fade } from "svelte/transition";
	import { TrendingUp } from "lucide-svelte";
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
		return maxDataValue * 1.5; // Extend the max value by 20%
	};
	let string = "";
	let value = 134;
	let prefix = "on";
	let showingViz = true;
	let showingName = true;
	const labels = Array.from({ length: 12 }, (_, i) => `mon ${12 + i}`);

	const data = {
		labels: labels,
		datasets: [
			{
				data: [1000, 800, 100, 123, 232, 255, 276, 463, 456, 123, 345, 244],
				backgroundColor: (context) => {
					const ctx = context.chart.ctx;
					const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height + 200);
					gradient.addColorStop(0, "rgba(144,183,226,1)");
					gradient.addColorStop(1, "rgba(55,59,68,0.5)");
					return gradient;
				},
                // borderColor: "rgba(255, 255, 255, 1)",
				// borderWidth: 2,
                hoverBackgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height + 200);
					gradient.addColorStop(0, "rgba(188,211,237,1)");
					gradient.addColorStop(1, "rgba(55,59,68,0.5)");
                    return gradient;
                },
                hoverBorderColor: "rgba(220, 220, 255, 1)",
                hoverBorderWidth: 2,
				borderRadius: 200,
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
			layout: {
				padding: 5,
			},
			scales: {
				x: {
					display: false,
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
					enabled: false
               
				},
			},
            events: ["mousemove", "mouseout"],  // Specify which events should be handled
            interaction: {
                mode: 'nearest',
                intersect: false

            },
			onHover: function (event, chartElement) {
				if (chartElement.length) {
					const context = chartElement[0];
					const dataPoint = context.element;
					const index = context.index;
					const datasetIndex = context.datasetIndex;
					const lolcow = data.datasets[datasetIndex].data[index];
					const label = data.labels[index];

					string = prefix + " " + label;
					value = lolcow;
					// Here you can do whatever you need with the label and value
				}
			},
		},
	};
	let fontSize = "16px"; // Default font size
	let lineHeight = "1.2";
	onMount(() => {
		const ctx = portfolio.getContext("2d");

		chartInstance = new Chart(ctx, config);

		chartInstance.canvas.addEventListener("mouseleave", function () {
			string = "";
			value = 1245;
		});

		const updateCanvasSize = () => {
			showingViz = container.clientWidth >= 140 && container.clientHeight >= 130;
			let value = Math.min(container.clientWidth, container.clientHeight);
			showingName = container.clientWidth >= 80;
			if (value > 133) {
				fontSize = `${value * 0.15}px`;
				lineHeight = `${value * 0.15 + 5}px`;
			}

			if (chartInstance) {
				chartInstance.resize();
				chartInstance.render();
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
		// Clean up the observer when the component is destroyed
	});
</script>

<div class="td {showingViz ? '' : 'flex-col'}" bind:this="{container}">
	{#if showingName}
		<h1
			class="pl-2 text-slate-500 p-1 m-1 mr-8 text-base line-clamp-1 absolute left-0 top-0"
			style="pointer-events: none;"
		>
			{item.type.windowName}
		</h1>
	{/if}

    <div class="absolute left-0 top-12">
        <h2 class="text-sm text-gray-400 ml-3 mr-2 line-clamp-2 ">Total Issues {string}</h2>
        <h1
            class="font-bold ml-3 mr-2"
            style="font-size: {fontSize}; line-height: {lineHeight}"
        >
            {value}
        </h1>
    </div>

	<div class="text-container">
		<div>
			
		</div>

		{#if showingViz}
			<h2 class="text-sm text-gray-400 ml-2 mr-2 mb-4 flex items-center">
				<TrendingUp class="w-4 h-4 mr-1 align-middle justify-center" /> 5.6%
			</h2>
		{/if}
	</div>

	<div class="chart-container" style="position: relative;" bind:this="{container}">
		<canvas class="mb-2 mr-2 ml-2" bind:this="{portfolio}"></canvas>
		
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
		min-width: 50%;
	}
</style>
