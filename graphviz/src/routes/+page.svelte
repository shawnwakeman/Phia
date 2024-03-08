<script lang="ts">
    import BarChart from "../lib/BarChart.svelte";
    import NodeCreator from "../lib/NodeCreator.svelte";
    import SideBar from "../lib/SideBar.svelte";
    import type { Node } from "../types/collection";
    import { selectedNodeId } from "../stores";

    export let data: { nodes: Node[] };

    let currentSelectedId: number;

    selectedNodeId.subscribe(value => {
        currentSelectedId = value;

        
        
    // You can now use currentSelectedId to perform any logic based on the selected node's ID
    });

    $: selectedNodeData = currentSelectedId !== null 
        ? data.nodes.find(node => node.id === currentSelectedId) 
        : null;





</script>


<h1>{selectedNodeData?.id}, {selectedNodeData?.name}, {selectedNodeData?.parent_id}, {selectedNodeData?.value}}</h1>
<BarChart data1 = {data}/>

<NodeCreator></NodeCreator>
<SideBar active = {true}/>

