<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";

	import { Chart } from "chart.js/auto";
	import { color } from "chart.js/helpers";
	import { MatrixElement, MatrixController } from "chartjs-chart-matrix";

	import "chartjs-adapter-date-fns";
	import { enUS } from "date-fns/locale";

	export function isoDayOfWeek(dt) {
		let wd = dt.getDay(); // 0..6, from sunday
		wd = ((wd + 6) % 7) + 1; // 1..7 from monday
		return "" + wd; // string so it gets parsed
	}

	export function startOfToday() {
		const d = new Date();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
	}

	function generateData() {
		const data = [];
		const end = startOfToday();
		let dt = new Date(new Date().setDate(end.getDate() - 365));
		while (dt <= end) {
			const iso = dt.toISOString().substr(0, 10);
			data.push({
				x: iso,
				y: isoDayOfWeek(dt),
				d: iso,
				v: Math.random() * 50,
			});
			dt = new Date(dt.setDate(dt.getDate() + 1));
		}
		return data;
	}

	export let item;
	import { fade } from "svelte/transition";

	let portfolio;
	let chartInstance;
    let parentElement
    let container

    let canvasWidth
    let canvasHeight
    const datas = generateData()


	const data = {
		datasets: [
			{
				label: "Basic matrix",
				data: datas,
				borderWidth: 1,
				borderRadius: 5,
				borderColor: "rgba(0,0,0,0.5)",
				backgroundColor(c) {
					const value = c.dataset.data[c.dataIndex].v;

					const minValue = 0;
					const maxValue = 50;

					// Calculate the percentage of the value within the range
					const percentage = (value - minValue) / (maxValue - minValue);

					// Adjust the lightness (intensity) based on the percentage
					const lightness = 50 + percentage * 50; // Ranges from 50% to 100%

					// Adjust the opacity (alpha) based on the percentage
					const alpha = 0.1 + percentage * 0.9; // Ranges from 0.1 to 1

					// Return the color in HSLA format
					return `hsla(0, 100%, ${lightness}%, ${alpha})`; // Red color with varying lightness and alpha
				},

				width: ({ chart }) =>
					((chart.chartArea || {}).right - (chart.chartArea || {}).left) / 53 - 1,
				height: ({ chart }) =>
					((chart.chartArea || {}).bottom - (chart.chartArea || {}).top) / 7 - 1,
			},
		],
	};
	const config = {
		type: "matrix",

		data: data,
		options: {
        
			maintainAspectRatio: false,
			layout: {
				autopadding: false,
			},
			responsive: true,
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
					
							return " ".repeat(context.label.length * 1.5) + context.raw.v;
						},
					},
				},
			},
			scales: {
				y: {
					type: "time",
					adapters: {
						date: {
							locale: enUS,
						},
					},
					offset: true,
					time: {
						unit: "day",
						round: "day",
						isoWeekday: 1,
						parser: "i",
						displayFormats: {
							day: "iiiiii",
						},
					},
					reverse: true,
					position: "right",
					ticks: {
						maxRotation: 0,
						autoSkip: true,
						padding: 1,
						font: {
							size: 9,
						},
					},
					grid: {
						display: false,
						drawBorder: false,
						tickLength: 0,
					},
				},
				x: {
					type: "time",

					adapters: {
						date: {
							locale: enUS,
						},
					},
					position: "bottom",
					offset: true,
					time: {
						unit: "week",
						round: "week",
						isoWeekday: 1,
						displayFormats: {
							week: "MMM dd",
						},
					},
					ticks: {
						maxRotation: 0,
						autoSkip: true,
						font: {
							size: 9,
						},
					},
					grid: {
						display: false,
						drawBorder: false,
						tickLength: 2,
					},
				},
			},
		},
	};

    const resizeCanvas = () => {
        if (container && portfolio) {
            const boundingRect = container.getBoundingClientRect();
            canvasWidth = boundingRect.width - 32;
            canvasHeight = boundingRect.height * 0.4877;
        }
    };
    



	onMount(() => {
       
		Chart.register(MatrixElement, MatrixController);
		const ctx = portfolio.getContext("2d");

		chartInstance = new Chart(ctx, config);

		const resizeObserver = new ResizeObserver(resizeCanvas);
            resizeObserver.observe(container);
            resizeCanvas();

            return () => {
                resizeObserver.unobserve(container);
                resizeObserver.disconnect();
                if (chartInstance) {
                    chartInstance.destroy();
                }
            };
	});
</script>

<div bind:this={container} class="td">
	<div class="text-container">
		<h1 class="font-bold text-lg ml-4 mr-2 mt-12">Trending up by 5.2% thiss</h1>
		<h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2">
			January - June 2024 or Issues vs. States
		</h2>
	</div>

    <div class="chart-container" style={`width: ${canvasWidth}px; height: ${canvasHeight}px;`}>
		<canvas  bind:this="{portfolio}"></canvas>
	</div>
</div>

<style>
	.td {

	}

	.chart-container {
		

        border: 2px solid red;
	}


	.text-container {
		white-space: nowrap;
		overflow: hidden;
	}
</style>
