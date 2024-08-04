<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	type $$Props = RangeCalendarPrimitive.DayProps;
	type $$Events = RangeCalendarPrimitive.DayEvents;

	export let date: $$Props["date"];
	export let month: $$Props["month"];
	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<RangeCalendarPrimitive.Day
	on:click
	{date}
	{month}
	class="{cn(
		buttonVariants({ variant: 'ghost' }),
		'h-8 w-8 p-0 font-normal data-[selected]:opacity-100',
		// Today
		'[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
		// Selection Start
		'data-[selection-start]:bg-primarySCn data-[selection-start]:text-primarySCn-foreground data-[selection-start]:hover:bg-primarySCn data-[selection-start]:hover:text-primarySCn-foreground data-[selection-start]:focus:bg-primarySCn data-[selection-start]:focus:text-primarySCn-foreground',
		// Selection End
		'data-[selection-end]:bg-primarySCn data-[selection-end]:text-primarySCn-foreground data-[selection-end]:hover:bg-primarySCn data-[selection-end]:hover:text-primarySCn-foreground data-[selection-end]:focus:bg-primarySCn data-[selection-end]:focus:text-primarySCn-foreground',
		// Outside months
		'data-[outside-month]:text-muted-foreground [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground data-[outside-month]:pointer-events-none data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:opacity-30',
		// Disabled
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
		// Unavailable
		'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
		className
	)}"
	{...$$restProps}
	let:disabled
	let:unavailable
	let:builder
>
	<slot {disabled} {unavailable} {builder}>
		{date.day}
	</slot>
</RangeCalendarPrimitive.Day>
