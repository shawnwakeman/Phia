<script lang="ts">
    import BarChart from "../lib/BarChart.svelte";
    import NodeCreator from "../lib/NodeCreator.svelte";
    import SideBar from "../lib/SideBar/SideBar.svelte";
 
    import IssueSection from "../lib/SideBar/IssueSection.svelte";
    import type { Node } from "../types/collection";
    import { selectedNodeId, nodesStore } from "../stores";

    let data: Node[] = [];
    nodesStore.subscribe(value => {
        data = value;
    })

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
<NodeCreator/>
<SideBar active = {true} currentSelectedNode= {selectedNodeData}/>


