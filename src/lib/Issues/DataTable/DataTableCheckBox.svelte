<script lang="ts">
    import { Checkbox } from "$lib/components/ui/checkbox";
    import type { Writable } from "svelte/store";
    import { Input } from "$lib/components/ui/input";
    export let checked: Writable<boolean>;
  </script>


   
  <Checkbox bind:checked={$checked} />
  <h1>aasd</h1>