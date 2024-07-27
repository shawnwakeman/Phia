<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import { Button } from "$lib/components/ui/button";
	import { settings, gridController } from "$lib/stores";
	import { setSetting } from "$lib/supabaseClient";
	import { onMount } from "svelte";
	import type { ChartOptions } from "../../types/collection";

	let defults: ChartOptions[] = [
		{   
            type: "pomodoro",
            windowName: "focustimer",
            header: "pomodoro",
            querry: "",
            description: "asdadsasddass",
			min: { w: 4, h: 6},
            max: { w: 10, h: 10 },
            isExpandable: true,
		},
		{
            type: "barchartbase",
            windowName: "Bar Chart",
            header: "Chart of bars",
            querry: "",
            description: "asdadsasddass",
			min: { w: 2, h: 3},
            max: { w: 12, h: 12 },
            isExpandable: true,
		},
		{
			type: "linechartbase",
			windowName: "Line Chart",
            header: "Line Chart Of some Data",
            querry: "",
            description: "hjgjhg JSAHGDKJHas JKAHSDG JK kJASHDG",
            min: { w: 2, h: 4},
            max: { w: 12, h: 12 },
            isExpandable: true,
		},
		{
			type: "piechartbase",
			windowName: "Pie Chart",
            header: "Chart of Pie",
            querry: "",
            description: "asdasd as das das as",
            min: { w: 2, h: 4},
            max: { w: 12, h: 12 },
            isExpandable: true,
		},
		{ 
            type: "heatmapbase",
            windowName: "Heat Map",
            header: "kool heat map",
            querry: "",
            description: "asdasd asdasd asd as",
			min: { w: 5, h: 3},
            max: { w: 12, h: 12 },
            isExpandable: true,
        },
		{ 
            type: "matrixmapbase",
            windowName: "Matrix",
            header: "Chart of barsa asdfasd",
            querry: "",
            description: "asdadsasddass",
            min: { w: 2, h: 4},
            max: { w: 12, h: 12 },
            isExpandable: true,
        },
		{ 
            type: "metricbarchartbase", 
            windowName: "Bar Chart metric",
            header: "Chart of bars",
            querry: "",
            description: "asdadsasddass",
			min: { w: 2, h: 2},
            max: { w: 12, h: 12 },
            isExpandable: false,
        },
		{ 
            type: "metriclinechartbase", 
            windowName: "Line Metric",
            header: "Chart of bars",
            querry: "",
            description: "asdadsasddass",
			min: { w: 2, h: 2},
            max: { w: 12, h: 12 },
            isExpandable: false,
        },
		{ 
            type: "metrictbase", 
            windowName: "Progress Metric",
            header: "Chart of bars",
            querry: "",
            description: "asdadsasddass",
			min: { w: 2, h: 2},
            max: { w: 12, h: 12 },
            isExpandable: false,
        }
	];

	function addNewItem(defaultItem) {
		let items;

		if ($settings.home.grid.usingSimple) {
			items = $settings.home.grid.focusLayout;
		} else {
			items = $settings.home.grid.gridLayout;
		}

		const min = defaultItem.min;
		const max = defaultItem.max;
        console.log(min);
        
		const newItem: ChartOptions = {
			type: defaultItem.type,
            windowName: defaultItem.windowName,
            header: defaultItem.header,
            querry: "",
            description: defaultItem.description,
            min: min,
            max: max,
            isExpandable: defaultItem.isExpandable
		
		};
		const newPosition = $gridController.getFirstAvailablePosition(min.w, min.h);
		items = newPosition
			? [
					...items,
					{
						id: crypto.randomUUID(),
						x: newPosition.x,
						y: newPosition.y,
						w: min.w,
						h: min.h,
						min,
						max,
						type: newItem,
					},
				]
			: items;

		if ($settings.home.grid.usingSimple) {
			$settings.home.grid.focusLayout = items;
		} else {
			$settings.home.grid.gridLayout = items;
		}

		setSetting($settings);
	}
</script>

<Sheet.Root>
	<Sheet.Trigger>Open</Sheet.Trigger>
	<Sheet.Content side="top">
		<Sheet.Header>
			<Sheet.Title>Choose an item to add</Sheet.Title>
			<Sheet.Description>
				{#each defults as choice}
					<Button on:click="{() => addNewItem(choice)}" variant="outline">{choice.type}</Button
					>
				{/each}
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
