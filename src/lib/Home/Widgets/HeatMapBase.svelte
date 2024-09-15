<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";

	import { Chart, Tooltip, CategoryScale, LinearScale, Title } from "chart.js";
	import { color } from "chart.js/helpers";
	import { MatrixElement, MatrixController } from "chartjs-chart-matrix";

	import * as Select from "$lib/components/ui/select";

	Chart.register(MatrixElement, MatrixController);

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

    export function startOfYesterday() {
        const today = startOfToday();
        today.setDate(today.getDate() - 1);
        return today;
    }




	function generateData(days) {
		const data = [];
		const end = startOfYesterday();
		let dt = new Date(new Date().setDate(end.getDate() - days));

		while (dt <= end) {
			const iso = dt.toISOString().substr(0, 10);
			data.push({
				x: iso,
				y: days === 7 ? 1 : isoDayOfWeek(dt),
				d: iso,
				v: Math.random() * 50,
			});
			dt = new Date(dt.setDate(dt.getDate() + 1));
		}

		return data;
	}

	export let item;

	let I9LO8portfolio;
	let I9chartInstance;

    let container;

	let showingViz = true;
	let showingName = true;

	let scalesWeek = {
		x: {
			type: "time",

			adapters: {
				date: {
					locale: enUS,
				},
			},
			position: "bottom",

			time: {
				unit: "day",
				round: "day",
				isoWeekday: 1,
				displayFormats: {
					day: "EEE",
				},
			},
			ticks: {
				maxRotation: 0,
				autoSkip: true,
			},
			grid: {
				display: false,
				drawBorder: false,
			},
		},
		y: {
			type: "linear",
			min: 0,
			max: 2,
			grid: {
				display: false,
			},
			ticks: {
				display: false, // Hides the y-axis labels
			},
			display: false, // Ensures the y-axis itself is not displayed
		},
	};

	let scalesmonth = {
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
					day: "EEE",
				},
			},
			reverse: true,
			position: "right",
			ticks: {
				maxRotation: 0,
				autoSkip: true,
				padding: 1,
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
			},
			grid: {
				display: false,
				drawBorder: false,
				tickLength: 2,
			},
		},
	};

	let scalesYear = {
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
			},
			grid: {
				display: false,
				drawBorder: false,
				tickLength: 2,
			},
		},
	};

	function getWeeksInMonth() {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		const startWeek = getWeekNumber(startOfMonth);
		const endWeek = getWeekNumber(endOfMonth);
		console.log("Weeks in month: " + (endWeek - startWeek + 1));
		return endWeek - startWeek + 1;
	}

	function getWeekNumber(d) {
		const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() + 4 - (date.getDay() || 7));
		const yearStart = new Date(date.getFullYear(), 0, 1);
		const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
		return weekNo;
	}

	let timeRange = "month"; // Change this to 'month' or 'week' as needed

	let days;
	let heightDivisor;
	let widthDivisor;
	let scale;
	let xscaler;
	let yscalar;
	let datas;

	switch (timeRange) {
		case "week":
			days = 7;
			datas = generateData(7);
			heightDivisor = 1; // Adjust heightDivisor for week
			widthDivisor = 7;
			scale = scalesWeek;

            break;
        case 'month':
            datas = generateData(30)
            heightDivisor = 7; // Adjust heightDivisor for month
            widthDivisor = 5
            scale = scalesmonth

            if (datas.length > 0) {
                const yCounts = datas.reduce((acc, item) => {
                    acc[item.y] = (acc[item.y] || 0) + 1;
                    return acc;
                }, {});
                console.log(yCounts);
                const maxYValue = Object.values(yCounts).reduce((a, b) => yCounts[a] > yCounts[b] ? a : b);
                let widthDivisor = parseInt(maxYValue)
               
            }
            break;
        case 'year':
        default:
            datas = generateData(365)
            heightDivisor = 7; // Adjust heightDivisor for year
            widthDivisor = 52
            scale = scalesYear
            xscaler = 0.8
            yscalar = .95
            break;
    }

	const data = {
		datasets: [
			{
				label: "Basic matrix",
				data: datas,
				borderWidth: 1,
                borderRadius: 2,
              
                backgroundColor(c) {
                const value = c.dataset.data[c.dataIndex].v;
                const alpha = (10 + value) / 60;
                return color('#2563eb').alpha(alpha).rgbString();
                },

				width: ({ chart }) =>
					(((chart.chartArea || {}).right - (chart.chartArea || {}).left) / widthDivisor - 1),
                height: ({ chart }) =>
               ( ((chart.chartArea || {}).bottom - (chart.chartArea || {}).top) / heightDivisor - 1),
			},
		],
	};

	const config = {
		type: "matrix",

		data: data,
		options: {
			maintainAspectRatio: false,
			responsive: false,
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					callbacks: {
						labelColor: function (I9context) {
							return {
								borderColor: "rgb(0, 0, 0)",
								backgroundColor: "#2563eb",
								borderWidth: 2,
							};
						},
						labelTextColor: function (I9context) {
							return "#A9A9A9";
						},
						label: function (I9context) {
							console.log(context);
							return " ".repeat(context.label.length * 1.5) + context.raw.v;
						},
					},
				},
			},
			scales: scale,
		},
	};

	onMount(() => {
        
		const ctx = portfolio.getContext("2d");
		chartInstance = new Chart(ctx, config);

        const updateCanvasSize = () => {
       
         
                chartInstance.resize()
            
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
            resizeObserver.disconnect()
		};
	});
</script>

<div class="td">

	{#if showingName}
        <h1
        class="pl-2 text-slate-500 p-1 m-1 mr-16 text-base line-clamp-1 absolute left-0 top-0"
            style="pointer-events: none;"
        >
            {item.type.windowName}
        </h1>
	{/if}



    <div class="flex justify-between items-center mt-12">
        <div>
            <h1 class="font-bold text-lg ml-4 mr-2 line-clamp-1">{item.type.header}</h1>

            <h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2 mb-2 line-clamp-1">
                {item.type.description}
            </h2>
        </div>
        {#if showingViz}
            <Select.Root>
                <Select.Trigger class="w-[90px] mb-2 mr-5 m">
                    <Select.Value placeholder="last" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="light">Light</Select.Item>
                    <Select.Item value="dark">Dark</Select.Item>
                    <Select.Item value="system">System</Select.Item>
                </Select.Content>
            </Select.Root>
        {/if}
    </div>
	

	<div class="chart-container" style="position: relative;" bind:this="{container}">
		<canvas bind:this="{portfolio}"></canvas>
		<div>&nbsp;</div>
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
