<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = SliderPrimitive.Props;

	let className: $$Props["class"] = undefined;
	export let value: $$Props["value"] = [0];
	export { className as class };
</script>

<SliderPrimitive.Root
	bind:value
	class="{cn('relative flex w-full touch-none select-none items-center', className)}"
	{...$$restProps}
	let:thumbs
>
	<span class="relative h-3 w-full grow overflow-hidden rounded-full bg-primarySCn/20">
		<SliderPrimitive.Range class="absolute h-full bg-primarySCn" />
	</span>
	{#each thumbs as thumb}
		<SliderPrimitive.Thumb
			{thumb}
			class="block h-6 w-6 rounded-full border border-primarySCn/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
		/>
	{/each}
</SliderPrimitive.Root>
