<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { toggleMode } from "mode-watcher";
	import Mail from "lucide-svelte/icons/mail";
	import { Button } from "$lib/components/ui/button/index.js";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import LoaderCircle from "lucide-svelte/icons/loader-circle";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label/index.js";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";

	import * as ContextMenu from "$lib/components/ui/context-menu/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	let showBookmarks = false;
	let showFullURLs = true;
	import { toast } from "svelte-sonner";
	let values = "pedro";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";

	import { Switch } from "$lib/components/ui/switch/index.js";
	import CirclePlus from "lucide-svelte/icons/circle-plus";
	import Cloud from "lucide-svelte/icons/cloud";
	import CreditCard from "lucide-svelte/icons/credit-card";
	import Github from "lucide-svelte/icons/github";
	import Keyboard from "lucide-svelte/icons/keyboard";
	import LifeBuoy from "lucide-svelte/icons/life-buoy";
	import LogOut from "lucide-svelte/icons/log-out";

	import MessageSquare from "lucide-svelte/icons/message-square";
	import Plus from "lucide-svelte/icons/plus";
	import Settings from "lucide-svelte/icons/settings";
	import User from "lucide-svelte/icons/user";
	import UserPlus from "lucide-svelte/icons/user-plus";
	import Users from "lucide-svelte/icons/users";

	import { Input } from "$lib/components/ui/input/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

	import * as Popover from "$lib/components/ui/popover/index.js";

	let saveStatus = "Saved";
	let editor: EditorType;

	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

	import * as Select from "$lib/components/ui/select/index.js";

	const fruits = [
		{ value: "apple", label: "Apple" },
		{ value: "banana", label: "Banana" },
		{ value: "blueberry", label: "Blueberry" },
		{ value: "grapes", label: "Grapes" },
		{ value: "pineapple", label: "Pineapple" },
	];
	import * as Sheet from "$lib/components/ui/sheet/index.js";

	import { cn } from "$lib/utils.js";

	////////////////////////////////////////////////////////////////////
	////////////////////////// Calendar ////////////////////////////////

	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		today,
	} from "@internationalized/date";

	import type { DateRange } from "bits-ui";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";

	const start = today(getLocalTimeZone());
	const end = start.add({ days: 7 });

	let valuew = {
		start,
		end,
	};

	const df = new DateFormatter("en-US", {
		dateStyle: "long",
	});

	let valuea: DateValue | undefined = undefined;

	let valuef = today(getLocalTimeZone());

	import CalendarIcon from "lucide-svelte/icons/calendar";

	let valueq: DateRange | undefined = {
		start: new CalendarDate(2022, 1, 20),
		end: new CalendarDate(2022, 1, 20).add({ days: 20 }),
	};

	let startValueq: DateValue | undefined = undefined;

	let valuez: DateValue | undefined = undefined;

	const items = [
		{ value: 0, label: "Today" },
		{ value: 1, label: "Tomorrow" },
		{ value: 3, label: "In 3 days" },
		{ value: 7, label: "In a week" },
	];
</script>

<div class="h-full overflow-y-auto">
	<button on:click="{toggleMode}">Toggle Mode</button>

	<Avatar.Root>
		<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
		<Avatar.Fallback>CN</Avatar.Fallback>
	</Avatar.Root>

	<Label class="m-2">simple inputs</Label>
	<div class="flex gap-2 mx-5 flex-wrap p-2">
		<Button>Button</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="link">Link</Button>

		<Button>
			<Mail class="mr-2 h-4 w-4" />
			Login with Email
		</Button>

		<Button variant="outline" size="icon">
			<ChevronRight class="h-4 w-4" />
		</Button>

		<Button disabled>
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			Please wait
		</Button>

		<Switch id="airplane-mode" />

		<Checkbox />

		<Slider value="{[50]}" max="{100}" step="{1}" class="max-w-[70%]" />

		<Select.Root portal="{null}">
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Select a fruit" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Fruits</Select.Label>
					{#each fruits as fruit}
						<Select.Item value="{fruit.value}" label="{fruit.label}"
							>{fruit.label}</Select.Item
						>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="favoriteFruit" />
		</Select.Root>

		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class="{cn(
						'w-[280px] justify-start text-left font-normal',
						!valuea && 'text-muted-foreground'
					)}"
					builders="{[builder]}"
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{valuea ? df.format(valuea.toDate(getLocalTimeZone())) : "Pick a date"}
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0">
				<Calendar bind:value="{valuea}" initialFocus />
			</Popover.Content>
		</Popover.Root>

		<Popover.Root openFocus>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class="{cn(
						'w-[300px] justify-start text-left font-normal',
						!valueq && 'text-muted-foreground'
					)}"
					builders="{[builder]}"
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{#if valueq && valueq.start}
						{#if valueq.end}
							{df.format(valueq.start.toDate(getLocalTimeZone()))} - {df.format(
								valueq.end.toDate(getLocalTimeZone())
							)}
						{:else}
							{df.format(valueq.start.toDate(getLocalTimeZone()))}
						{/if}
					{:else if startValueq}
						{df.format(startValueq.toDate(getLocalTimeZone()))}
					{:else}
						Pick a date
					{/if}
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<RangeCalendar
					bind:value="{valueq}"
					bind:startValue="{startValueq}"
					initialFocus
					numberOfMonths="{1}"
					placeholder="{valueq?.start}"
				/>
			</Popover.Content>
		</Popover.Root>

		<Popover.Root openFocus>
			<Popover.Trigger asChild let:builder>
				<Button
					variant="outline"
					class="{cn(
						'w-[280px] justify-start text-left font-normal',
						!valuez && 'text-muted-foreground'
					)}"
					builders="{[builder]}"
				>
					<CalendarIcon class="mr-2 h-4 w-4" />
					{valuez ? df.format(valuez.toDate(getLocalTimeZone())) : "Pick a date"}
				</Button>
			</Popover.Trigger>
			<Popover.Content class="flex w-auto flex-col space-y-2 p-2">
				<Select.Root
					{items}
					onSelectedChange="{(v) => {
						if (!v) return;
						valuez = today(getLocalTimeZone()).add({ days: v.value });
					}}"
				>
					<Select.Trigger>
						<Select.Value placeholder="Select" />
					</Select.Trigger>
					<Select.Content>
						{#each items as item}
							<Select.Item value="{item.value}">{item.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<div class="rounded-md border">
					<Calendar bind:value="{valuez}" />
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<Label class="m-2">complex ui</Label>
	<div class="flex gap-2 mx-5 flex-wrap p-2">
		<Collapsible.Root class="w-[350px] space-y-2">
			<div class="flex items-center justify-between space-x-4 px-4">
				<h4 class="text-sm font-semibold">@huntabyte starred 3 repositories</h4>
				<Collapsible.Trigger asChild let:builder>
					<Button builders="{[builder]}" variant="ghost" size="sm" class="w-9 p-0">
						<ChevronsUpDown class="h-4 w-4" />
						<span class="sr-only">Toggle</span>
					</Button>
				</Collapsible.Trigger>
			</div>
			<div class="rounded-md border px-4 py-3 font-mono text-sm">@huntabyte/bits-ui</div>
			<Collapsible.Content class="space-y-2">
				<div class="rounded-md border px-4 py-3 font-mono text-sm">@melt-ui/melt-ui</div>
				<div class="rounded-md border px-4 py-3 font-mono text-sm">@sveltejs/svelte</div>
			</Collapsible.Content>
		</Collapsible.Root>

		<ContextMenu.Root>
			<ContextMenu.Trigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenu.Trigger>
			<ContextMenu.Content class="w-64">
				<ContextMenu.Item inset>
					Back
					<ContextMenu.Shortcut>⌘[</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Item inset>
					Forward
					<ContextMenu.Shortcut>⌘]</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Item inset>
					Reload
					<ContextMenu.Shortcut>⌘R</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Sub>
					<ContextMenu.SubTrigger inset>More Tools</ContextMenu.SubTrigger>
					<ContextMenu.SubContent class="w-48">
						<ContextMenu.Item>
							Save Page As...
							<ContextMenu.Shortcut>⇧⌘S</ContextMenu.Shortcut>
						</ContextMenu.Item>
						<ContextMenu.Item>Create Shortcut...</ContextMenu.Item>
						<ContextMenu.Item>Name Window...</ContextMenu.Item>
						<ContextMenu.Separator />
						<ContextMenu.Item>Developer Tools</ContextMenu.Item>
					</ContextMenu.SubContent>
				</ContextMenu.Sub>
				<ContextMenu.Separator />
				<ContextMenu.CheckboxItem bind:checked="{showBookmarks}">
					Show Bookmarks Bar
					<ContextMenu.Shortcut>⌘⇧B</ContextMenu.Shortcut>
				</ContextMenu.CheckboxItem>
				<ContextMenu.CheckboxItem bind:checked="{showFullURLs}">
					Show Full URLs
				</ContextMenu.CheckboxItem>
				<ContextMenu.Separator />
				<ContextMenu.RadioGroup bind:value="{values}">
					<ContextMenu.Label inset>People</ContextMenu.Label>
					<ContextMenu.Separator />
					<ContextMenu.RadioItem value="pedro">Pedro Duarte</ContextMenu.RadioItem>
					<ContextMenu.RadioItem value="colm">Colm Tuite</ContextMenu.RadioItem>
				</ContextMenu.RadioGroup>
			</ContextMenu.Content>
		</ContextMenu.Root>

		<Sheet.Root>
			<Sheet.Trigger asChild let:builder>
				<Button builders="{[builder]}" variant="outline">Open</Button>
			</Sheet.Trigger>
			<Sheet.Content side="right">
				<Sheet.Header>
					<Sheet.Title>Edit profile</Sheet.Title>
					<Sheet.Description>
						Make changes to your profile here. Click save when you're done.
					</Sheet.Description>
				</Sheet.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="name" class="text-right">Name</Label>
						<Input id="name" value="Pedro Duarte" class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="username" class="text-right">Username</Label>
						<Input id="username" value="@peduarte" class="col-span-3" />
					</div>
				</div>
				<Sheet.Footer>
					<Sheet.Close asChild let:builder>
						<Button builders="{[builder]}" type="submit">Save changes</Button>
					</Sheet.Close>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>

		<Dialog.Root>
			<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })}"
				>Edit Profile</Dialog.Trigger
			>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>Edit profile</Dialog.Title>
					<Dialog.Description>
						Make changes to your profile here. Click save when you're done.
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="name" class="text-right">Name</Label>
						<Input id="name" value="Pedro Duarte" class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="username" class="text-right">Username</Label>
						<Input id="username" value="@peduarte" class="col-span-3" />
					</div>
				</div>
				<Dialog.Footer>
					<Button type="submit">Save changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders="{[builder]}" variant="outline">Open</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<User class="mr-2 h-4 w-4" />
						<span>Profile</span>
						<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<CreditCard class="mr-2 h-4 w-4" />
						<span>Billing</span>
						<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<Settings class="mr-2 h-4 w-4" />
						<span>Settings</span>
						<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<Keyboard class="mr-2 h-4 w-4" />
						<span>Keyboard shortcuts</span>
						<DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<Users class="mr-2 h-4 w-4" />
						<span>Team</span>
					</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<UserPlus class="mr-2 h-4 w-4" />
							<span>Invite users</span>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.Item>
								<Mail class="mr-2 h-4 w-4" />
								<span>Email</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<MessageSquare class="mr-2 h-4 w-4" />
								<span>Message</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<CirclePlus class="mr-2 h-4 w-4" />
								<span>More...</span>
							</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
					<DropdownMenu.Item>
						<Plus class="mr-2 h-4 w-4" />
						<span>New Team</span>
						<DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<Github class="mr-2 h-4 w-4" />
					<span>GitHub</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<LifeBuoy class="mr-2 h-4 w-4" />
					<span>Support</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<Cloud class="mr-2 h-4 w-4" />
					<span>API</span>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<LogOut class="mr-2 h-4 w-4" />
					<span>Log out</span>
					<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<RadioGroup.Root value="comfortable">
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="default" id="r1" />
				<Label for="r1">Default</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="comfortable" id="r2" />
				<Label for="r2">Comfortable</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="compact" id="r3" />
				<Label for="r3">Compact</Label>
			</div>
			<RadioGroup.Input name="spacing" />
		</RadioGroup.Root>

		<Calendar bind:value="{valuef}" class="rounded-md border shadow" />
		<RangeCalendar bind:value="{valuew}" class="rounded-md border shadow" />

		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button builders="{[builder]}" variant="outline">Hover</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Add to library</p>
			</Tooltip.Content>
		</Tooltip.Root>

		<Popover.Root portal="{null}">
			<Popover.Trigger asChild let:builder>
				<Button builders="{[builder]}" variant="outline">Open</Button>
			</Popover.Trigger>
			<Popover.Content class="w-80">
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="font-medium leading-none">Dimensions</h4>
						<p class="text-muted-foreground text-sm">
							Set the dimensions for the layer.
						</p>
					</div>
					<div class="grid gap-2">
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="width">Width</Label>
							<Input id="width" value="100%" class="col-span-2 h-8" />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="maxWidth">Max. width</Label>
							<Input id="maxWidth" value="300px" class="col-span-2 h-8" />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="height">Height</Label>
							<Input id="height" value="25px" class="col-span-2 h-8" />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="maxHeight">Max. height</Label>
							<Input id="maxHeight" value="none" class="col-span-2 h-8" />
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>

		<ScrollArea class="h-72 w-48 rounded-md border">
			<div class="p-4">
				<h4 class="mb-4 text-sm font-medium leading-none">Tags</h4>
				{#each tags as tag}
					<div class="text-sm">
						{tag}
					</div>
					<Separator class="my-2" />
				{/each}
			</div>
		</ScrollArea>

		<Button
			variant="outline"
			on:click="{() =>
				toast.success('Event has been created', {
					description: 'Sunday, December 03, 2023 at 9:00 AM',
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo'),
					},
				})}"
		>
			Show Toast
		</Button>
	</div>

	<Label class="m-2">main looks</Label>

	<div></div>
	<div class="flex gap-2 mx-5 flex-wrap p-2">
		<div class="feature-container p-10">
            <div class="flex gap-2 mx-5 flex-wrap p-2">
                <div>
                    <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        The Joke Tax Chronicles
                    </h1>
                    <p class="leading-7 [&:not(:first-child)]:mt-6">
                        Once upon a time, in a far-off land, there was a very lazy king who spent all day
                        lounging on his throne. One day, his advisors came to him with a problem: the
                        kingdom was running out of money.
                    </p>
                    <h2
                        class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
                    >
                        The King's Plan
                    </h2>
                    <p class="leading-7 [&:not(:first-child)]:mt-6">
                        The king thought long and hard, and finally came up with
                        <a href="##" class="text-primary font-medium underline underline-offset-4">
                            a brilliant plan
                        </a>
                        : he would tax the jokes in the kingdom.
                    </p>
                    <blockquote class="mt-6 border-l-2 pl-6 italic">
                        "After all," he said, "everyone enjoys a good joke, so it's only fair that they
                        should pay for the privilege."
                    </blockquote>
                    <h3 class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">The Joke Tax</h3>
                    <p class="leading-7 [&:not(:first-child)]:mt-6">
                        The king's subjects were not amused. They grumbled and complained, but the king was
                        firm:
                    </p>
                    <ul class="my-6 ml-6 list-disc [&>li]:mt-2">
                        <li>1st level of puns: 5 gold coins</li>
                        <li>2nd level of jokes: 10 gold coins</li>
                        <li>3rd level of one-liners : 20 gold coins</li>
                    </ul>
                    
                </div>
            </div>
		</div>
	</div>

	<Label class="m-2">main looks</Label>
	<div class="flex gap-2 mx-5 flex-wrap p-2">
		<div class="color-box text-muted-foreground bg-muted">Muted</div>
		<div class="color-box text-card-foreground bg-card">Card</div>
		<div class="color-box text-border-foreground bg-border">Border</div>
		<div class="color-box text-input-foreground bg-input">Input</div>
		<div class="color-box text-primarySCn-foreground bg-primarySCn">primary</div>
		<div class="color-box text-primary-foreground bg-primary">primary</div>
		<div class="color-box text-secondary-foreground bg-secondary">Secondary</div>
		<div class="color-box text-accent-foreground bg-accent">Accent</div>
		<div class="color-box text-destructive-foreground bg-destructive">Destructive</div>
		<div class="color-box text-ring-foreground bg-ring">Ring</div>
		<div class="color-box text-info-foreground bg-info">Info</div>
		<div class="color-box text-success-foreground bg-success">Success</div>
		<div class="color-box text-warning-foreground bg-warning">Warning</div>

        <div class="color-box text-mainSecondary-foreground bg-mainSecondary">Secondary</div>
        <div class="color-box text-mainAccent-foreground bg-mainAccent">acc</div>

	</div>

	<Label class="m-2">editor</Label>
	<div class="flex gap-2 mx-5 flex-wrap p-2">
		<!-- <Editor
        bind:editor
        onUpdate={() => {
            saveStatus = 'Unsaved';
        }}
        onDebouncedUpdate={async () => {
            saveStatus = 'Saving...';
            
    
            setTimeout(() => {
                saveStatus = 'Saved';
            }, 500);
        }}
    >
        <div
            class="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400"
        >
            {saveStatus}
        </div>
    </Editor> -->
	</div>

	<Label class="m-2">text</Label>
	<div class="flex gap-2 mx-5 flex-wrap p-2">
		<div>
			<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
				The Joke Tax Chronicles
			</h1>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				Once upon a time, in a far-off land, there was a very lazy king who spent all day
				lounging on his throne. One day, his advisors came to him with a problem: the
				kingdom was running out of money.
			</p>
			<h2
				class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
			>
				The King's Plan
			</h2>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				The king thought long and hard, and finally came up with
				<a href="##" class="text-primary font-medium underline underline-offset-4">
					a brilliant plan
				</a>
				: he would tax the jokes in the kingdom.
			</p>
			<blockquote class="mt-6 border-l-2 pl-6 italic">
				"After all," he said, "everyone enjoys a good joke, so it's only fair that they
				should pay for the privilege."
			</blockquote>
			<h3 class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">The Joke Tax</h3>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				The king's subjects were not amused. They grumbled and complained, but the king was
				firm:
			</p>
			<ul class="my-6 ml-6 list-disc [&>li]:mt-2">
				<li>1st level of puns: 5 gold coins</li>
				<li>2nd level of jokes: 10 gold coins</li>
				<li>3rd level of one-liners : 20 gold coins</li>
			</ul>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				As a result, people stopped telling jokes, and the kingdom fell into a gloom. But
				there was one person who refused to let the king's foolishness get him down: a court
				jester named Jokester.
			</p>
			<h3 class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
				Jokester's Revolt
			</h3>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				Jokester began sneaking into the castle in the middle of the night and leaving jokes
				all over the place: under the king's pillow, in his soup, even in the royal toilet.
				The king was furious, but he couldn't seem to stop Jokester.
			</p>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				And then, one day, the people of the kingdom discovered that the jokes left by
				Jokester were so funny that they couldn't help but laugh. And once they started
				laughing, they couldn't stop.
			</p>
			<h3 class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
				The People's Rebellion
			</h3>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				The people of the kingdom, feeling uplifted by the laughter, started to tell jokes
				and puns again, and soon the entire kingdom was in on the joke.
			</p>
			<div class="my-6 overflow-y-auto">
				<table class="w-full">
					<thead>
						<tr class="even:bg-muted m-0 border-t p-0">
							<th
								class="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								King's Treasury
							</th>
							<th
								class="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								People's happiness
							</th>
						</tr>
					</thead>
					<tbody>
						<tr class="even:bg-muted m-0 border-t p-0">
							<td
								class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								Empty
							</td>
							<td
								class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								Overflowing
							</td>
						</tr>
						<tr class="even:bg-muted m-0 border-t p-0">
							<td
								class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								Modest
							</td>
							<td
								class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								Satisfied
							</td>
						</tr>
						<tr class="even:bg-muted m-0 border-t p-0">
							<td
								class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								Full
							</td>
							<td
								class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
							>
								Ecstatic
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				The king, seeing how much happier his subjects were, realized the error of his ways
				and repealed the joke tax. Jokester was declared a hero, and the kingdom lived
				happily ever after.
			</p>
			<p class="leading-7 [&:not(:first-child)]:mt-6">
				The moral of the story is: never underestimate the power of a good laugh and always
				be careful of bad ideas.
			</p>
		</div>
	</div>
</div>

<style>
	:root {
		--info: hsl(228, 100%, 59%);
		--info-foreground: hsl(0, 0%, 96%);

		--success: hsl(120, 60%, 50%);
		--success-foreground: hsl(120, 60%, 10%);

		--warning: hsl(45, 100%, 50%);
		--warning-foreground: hsl(45, 100%, 10%);

		--app: hsl(155, 62%, 48%);

        --app: hsl(155, 62%, 48%);

	}

	.color-box {
		width: 150px;
		height: 150px;
		margin: 20px;
		display: inline-block;
		border-radius: var(--radius);
		text-align: center;
		line-height: 150px;

		font-family: Arial, sans-serif;
	}
</style>
