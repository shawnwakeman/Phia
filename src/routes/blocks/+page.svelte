<script lang="ts">

    import type { Issue, Node } from "../../types/collection";
    import BarChart from "$lib/BarChart.svelte";


    export let data: { nodes: Node[], issues: Issue[], rootNode: Node };
</script>

