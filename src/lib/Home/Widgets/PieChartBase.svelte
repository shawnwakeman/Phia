<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
	import ChartDataLabels from "chartjs-plugin-datalabels";
	export let item;
	import { fade } from "svelte/transition";

	let portfolio;
	let chartInstance;

	let container;

	let showingViz = true;
	let showingName = true;

	let type = "doughnut";
	let ishalf = false;
	let ismany = true;

	const data = {
		labels: ["Aasdasd", "asdasdB", "asdasdasd", "asdasd", "asdasd", "F", "G", "H", "I"],
		datasets: [
			{
				data: [300, 123, 100, 112, 123, 345],
				backgroundColor: (context) => {
					const colors = [
						{ start: "rgba(70, 128, 255, 0.7)", end: "rgba(12, 191, 255, 0.5)" }, // Light blue to deep sky blue
						{ start: "rgba(30, 144, 255, 0.7)", end: "rgba(65, 105, 225, 0.5)" }, // Blue to dark blue
						{ start: "rgba(54, 130, 255, 0.7)", end: "rgba(100, 87, 237, 0.5)" }, // Steel blue to cornflower blue
						{ start: "rgba(30, 144, 255, 0.7)", end: "rgba(65, 105, 225, 0.5)" }, // Dodger blue to royal blue  // Medium turquoise to light sea green
					];
					const ctx = context.chart.ctx;
					const index = context.dataIndex;
					if (index) {
						const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
						gradient.addColorStop(0, colors[index % colors.length].start);
						gradient.addColorStop(1, colors[index % colors.length].end);
						return gradient;
					} else {
						const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
						gradient.addColorStop(0, colors[colors.length - 1].start);
						gradient.addColorStop(1, colors[colors.length - 1].end);
						return gradient;
					}
				},

				borderColor: "#36383b",
				hoverBorderColor: "#36383b",

				borderWidth: 5,
				borderRadius: {
					outerEnd: ishalf ? 10 : 8,
					innerEnd: ishalf ? 10 : 6,
					outerStart: ishalf ? 10 : 8,
					innerStart: ishalf ? 10 : 6,
				},
				hoverOffset: 20,
			},
		],
	};

	const config = {
		type: type,
		data: data,

		options: {
			maintainAspectRatio: false,
			responsive: false,

			rotation: ishalf ? -90 : 100,
			circumference: ishalf ? 180 : 360,
			cutout: ishalf ? "80%" : "35%",

			plugins: {
				legend: {
					display: false,
				},
				datalabels: {
					color: "rgba(255, 255, 255, 0.5)",
					font: {},
					formatter: (value, context) => {
						return context.chart.data.labels[context.dataIndex];
					},
					display: "auto",
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
					intersect: false,
				},
			},
		},
		plugins: [
			//     {
			//     id: 'customCenterLabel',
			//     beforeDraw: (chart) => {
			//         const ctx = chart.ctx;
			//         const chartArea = chart.chartArea;
			//         const centerX = (chartArea.left + chartArea.right) / 2;
			//         const centerY = (chartArea.top + chartArea.bottom) / 2;

			//         ctx.save();
			//         ctx.font = `${chart.options.plugins.customCenterLabel.font.weight} ${chart.options.plugins.customCenterLabel.font.size}px ${chart.options.plugins.customCenterLabel.font.family}`;
			//         ctx.fillStyle = chart.options.plugins.customCenterLabel.font.color;
			//         ctx.textAlign = 'center';
			//         ctx.textBaseline = 'middle';
			//         ctx.fillText(chart.options.plugins.customCenterLabel.text, centerX, centerY);
			//         ctx.restore();
			//     }
			// },
			ChartDataLabels,
		],
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
