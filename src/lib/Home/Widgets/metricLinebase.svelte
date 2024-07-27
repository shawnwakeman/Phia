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
		return maxDataValue * 1.1; // Extend the max value by 20%
	};

    let string = ""
    let value = 1245

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
                    pointBorderWidth: 2,
                    pointBackgroundColor: "rgb(55, 56, 60)",
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
                    intersect: false
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
