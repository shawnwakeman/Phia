<script>
	import { onMount, afterUpdate, onDestroy } from "svelte";

    import { Chart, Tooltip, CategoryScale, LinearScale, Title } from 'chart.js';
    import { color } from 'chart.js/helpers';
    import { MatrixElement, MatrixController } from 'chartjs-chart-matrix';


    Chart.register(MatrixElement, MatrixController);

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



    function generateData(days) {
        const data = [];
        const end = startOfToday();
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
	import { fade } from "svelte/transition";

	let portfolio;
	let chartInstance;

    let container;

    
    let scale = {
      x: {
        ticks: {
          stepSize: 1
        },
        grid: {
          display: false
        }
      },
      y: {
        offset: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          display: false
        }
      }
    }



   

	const data = {
		datasets: [
			{
				label: "Basic matrix",
                data: [
                    {x: 1, y: 1, v: 11},
                    {x: 1, y: 2, v: 12},
                    {x: 1, y: 3, v: 13},
                    {x: 2, y: 1, v: 21},
                    {x: 2, y: 2, v: 22},
                    {x: 2, y: 3, v: 23},
                    {x: 3, y: 1, v: 31},
                    {x: 3, y: 2, v: 32},
                    {x: 3, y: 3, v: 33}
                ],
				borderWidth: 1,
                borderRadius: 2,
              
                backgroundColor(c) {
                const value = c.dataset.data[c.dataIndex].v;
                const alpha = (10 + value) / 60;
                return color('#2563eb').alpha(alpha).rgbString();
                },

				width: ({ chart }) =>
					(chart.chartArea || {}).width / 3 - 1 ,
                height: ({ chart }) =>
                (chart.chartArea || {}).height/ 3 - 1,
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
                    title() {
                        return '';
                    },
                    label(context) {
                        const v = context.dataset.data[context.dataIndex];
                        return ['x: ' + v.x, 'y: ' + v.y, 'v: ' + v.v];
                    }
                    }
                }
                  
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
    <div class="text-container ">
        <h1 class="font-bold text-lg ml-4 mr-2 mt-12">{item.type.header}</h1>
        <h2 class="text-sm text-gray-400 ml-4 mt-1 mr-2 ">{item.type.description}</h2>
    
    </div>
	
	<div class="chart-container" style="position: relative;" bind:this="{container}">
        <canvas bind:this="{portfolio}"></canvas>
        <div>&nbsp;</div>
	</div>
    <div class="text-container ">
        <h1 class="font-medium ml-4 mt-2 mr-2 mb-3">Trending up by 5.2% this month</h1>
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

