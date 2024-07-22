<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";
	import Chart from "chart.js/auto";
    
	export let item;
	import { fade } from "svelte/transition";
  
	let portfolio;
	let chartInstance;


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
				backgroundColor: ["rgba(37, 99, 235, 0.5)"],
                borderColor: "#2563eb",
	
         

            
			},
         
		],
	};

	const config = {
		type: "pie",
		data: data,

		options: {
			maintainAspectRatio: false,
            layout: {
                autopadding: false
            },
		
	
            responsive: true,
			scales: {
              
				
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
                    intersect: false
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
    <div class="text-container ">
        <h1 class="font-bold text-lg ml-4 mr-2 mt-12">Trending up by 5.2% this</h1>
        <h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2">January - June 2024 or Issues vs. States</h2>
    
    </div>
	
	<div class="chart-container" style="position: relative;">
		<canvas bind:this="{portfolio}"></canvas>
	</div>

	<div class="text-container ">
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

      .text-container{
        white-space: nowrap;
        overflow: hidden;
    }
</style>
