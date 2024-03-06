<script lang="ts">
    import BarChart from "../lib/BarChart.svelte";
    import type { Node } from "../types/collection"

    export let data: { nodes: Node[] };

    let v = data.nodes[0].name


</script>


<BarChart data1 = {data}/>
