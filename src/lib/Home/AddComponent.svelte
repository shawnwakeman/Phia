<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import { Button } from "$lib/components/ui/button";
	import { settings, gridController } from "$lib/stores";
	import { setSetting } from "$lib/supabaseClient";

	function addNewItem() {
		let items;

		if ($settings.home.grid.usingSimple) {
			items = $settings.home.grid.focusLayout;
		} else {
			items = $settings.home.grid.gridLayout;
		}

		const w = Math.floor(Math.random() * 2) + 1;
		const h = Math.floor(Math.random() * 5) + 1;
        const min = { w: 1, h: 1 }
        const max = { w: 10, h: 10 }
        const type = {
                        type: 'heatmapbase',
                        options: {
                            axis: 'time',
                            value: 100,
                            description: 'Time spent on tasks'
                        }
                    }
		const newPosition = $gridController.getFirstAvailablePosition(w, h);
		items = newPosition
			? [
					...items,
					{
						id: crypto.randomUUID(),
						x: newPosition.x,
						y: newPosition.y,
						w,
						h,
                        min,
                        max,
                        type
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
	<Sheet.Content side="{'top'}">
		<Sheet.Header>
			<Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
			<Sheet.Description>
				This action cannot be undone. This will permanently delete your
				account and remove your data from our servers.

				<Button on:click="{addNewItem}" variant="outline">Button</Button
				>
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
