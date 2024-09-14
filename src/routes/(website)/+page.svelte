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

	import { getLocalTimeZone, today } from "@internationalized/date";
	import { Calendar } from "$lib/components/ui/calendar/index.js";

	import * as Popover from "$lib/components/ui/popover/index.js";

	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

	let value = today(getLocalTimeZone());

	import * as Select from "$lib/components/ui/select/index.js";

	const fruits = [
		{ value: "apple", label: "Apple" },
		{ value: "banana", label: "Banana" },
		{ value: "blueberry", label: "Blueberry" },
		{ value: "grapes", label: "Grapes" },
		{ value: "pineapple", label: "Pineapple" },
	];
	import * as Sheet from "$lib/components/ui/sheet/index.js";
</script>

<button on:click="{toggleMode}">Toggle Mode</button>

<h1>HOME</h1>
<p>👇 will redirect you to /auth if you aren't authenticated.</p>
<a href="/app">App</a>

<Avatar.Root>
	<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
	<Avatar.Fallback>CN</Avatar.Fallback>
</Avatar.Root>

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

<Slider value="{[50]}" max="{100}" step="{1}" class="max-w-[70%]" />
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

<Select.Root portal="{null}">
	<Select.Trigger class="w-[180px]">
		<Select.Value placeholder="Select a fruit" />
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Fruits</Select.Label>
			{#each fruits as fruit}
				<Select.Item value="{fruit.value}" label="{fruit.label}">{fruit.label}</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<Select.Input name="favoriteFruit" />
</Select.Root>

<Dialog.Root>
	<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })}">Edit Profile</Dialog.Trigger>
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

<Calendar bind:value class="rounded-md border" />

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
				<p class="text-muted-foreground text-sm">Set the dimensions for the layer.</p>
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

<div class="color-box bg-muted">Muted</div>
<div class="color-box bg-card">Card</div>
<div class="color-box bg-border">Border</div>
<div class="color-box bg-input">Input</div>
<div class="color-box bg-primarySCn">primarySCn</div>
<div class="color-box bg-secondary">Secondary</div>
<div class="color-box bg-accent">Accent</div>
<div class="color-box bg-destructive">Destructive</div>
<div class="color-box bg-ring">Ring</div>
<div class="color-box bg-info">Info</div>
<div class="color-box bg-success">Success</div>
<div class="color-box bg-warning">Warning</div>

<style>
	:root {
		--info: hsl(228, 100%, 59%);
		--info-foreground: hsl(0, 0%, 96%);

		--success: hsl(120, 60%, 50%);
		--success-foreground: hsl(120, 60%, 10%);

		--warning: hsl(45, 100%, 50%);
		--warning-foreground: hsl(45, 100%, 10%);

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
