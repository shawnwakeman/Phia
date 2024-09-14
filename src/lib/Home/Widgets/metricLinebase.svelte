<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart, { elements } from "chart.js/auto";
    import { TrendingUp } from 'lucide-svelte';
	export let item;
	import { fade } from "svelte/transition";

	let portfolio;
	let chartInstance;

	let delayed;
	let canvasWidth;
	let canvasHeight;

    let container;

    let isCurved = false;
    let isFilled = false;
    let pointStyles = true;
	const getDynamicMax = (data) => {
		const maxDataValue = Math.max(...data.datasets[0].data);
		return maxDataValue * 1.5; // Extend the max value by 20%
	};
	let showingViz = true;
	let showingName = true;

    let string = ""
    let value = 1245
    let prefix = "on";
    
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
				data: [1000, 800, 100, 123, 232, 255, 276, 463, 456],

                borderColor: "rgb(89, 104, 125)",
                cubicInterpolationMode: isCurved ? "monotone" : "default",
                pointBorderWidth: 2,
                borderWidth: 2,
                fill: isFilled ? "origin" : false
			},
            // {
			// 	data: [123, 345, 244, 333, 124, 321, 123, 152, 1125],
            //     backgroundColor: ["#e263eb"],
            //     borderColor: "rgba(0, 0, 0, 0.3)",
			// 	// borderWidth: 1,
            //     cubicInterpolationMode: isCurved ? "monotone" : "default",
            //     pointStyles: pointStyles ? "circle" : false,
		
			// },
            // {
			// 	data: [123, 878, 345, 123, 678, 234, 456, 123, 633],
    
			// 	// borderWidth: 1,
            //     cubicInterpolationMode: isCurved ? "monotone" : "default",
             
	
			// },
		],
	};

	const config = {
		type: "line",
		data: data,

		options: {
            elements: {
                point: {
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    pointBorderWidth: 2,
                    pointBackgroundColor: "rgb(55, 56, 60)",
                    pointHoverBackgroundColor: "rgb(89, 104, 125)",
                    pointHoverBorderWidth: 2,
                    pointHoverBorderColor: "rgba(220, 220, 255, 1)",
                    pointStyle: pointStyles ? "circle" : false,
                },
                line: {
                    borderCapStyle: 'round', // This rounds the ends of the lines
                }
            },
			maintainAspectRatio: false,
            responsive: false,
            borderJoinStyle: "bevel",
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
				},
				y: {
                    display: false,
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
