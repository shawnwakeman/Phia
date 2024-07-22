<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
	import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
    import 'chartjs-adapter-date-fns';
    import { enUS } from 'date-fns/locale';

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

	let delayed;
	let canvasWidth;
	let canvasHeight;

	let isCurved = true;
	let isFilled = true;
	let pointStyles = true;
	const getDynamicMax = (data) => {
		const maxDataValue = Math.max(...data.datasets[0].data);
		return maxDataValue * 1.1; // Extend the max value by 20%
	};

	const data = {
		datasets: [
			{
				label: "Basic matrix",
				data: generateData(),
				borderWidth: 1,
				borderColor: "rgba(0,0,0,0.5)",
				backgroundColor: "rgba(200,200,0,0.3)",
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
                aspectRatio: 5,
                maintainAspectRatio: true,
            layout: {
                autopadding: false
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
							console.log(context);
							return " ".repeat(context.label.length * 1.5) + context.raw;
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

	onMount(() => {
		Chart.register(MatrixController, MatrixElement);
		const ctx = portfolio.getContext("2d");
		chartInstance = new Chart(ctx, config);

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
	});
</script>

<div class="td">
	<div class="text-container">
		<h1 class="font-bold text-lg ml-4 mr-2 mt-12">Trending up by 5.2% thiss</h1>
		<h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2">
			January - June 2024 or Issues vs. States
		</h2>
	</div>

	<div class="chart-container" style="position: relative;" >
		<canvas  bind:this="{portfolio}"></canvas>
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

    

	.text-container {
		white-space: nowrap;
		overflow: hidden;
	}
</style>
