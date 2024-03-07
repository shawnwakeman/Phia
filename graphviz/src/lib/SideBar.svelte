<script lang="ts">
    import { selectedNodeId } from "../stores";
    import type { Node } from "../types/collection";
	export let active: Boolean;
    
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


<button on:click={()=> active = !active}>
	{active? 'Close' : 'Open'} Menu
</button>
<aside class:active>
	<h1>{selectedNodeData?.id}, {selectedNodeData?.name}, {selectedNodeData?.parent_id}, {selectedNodeData?.value}}</h1>
</aside>

<style>
	aside {
		position: absolute;
		left: -500px;
		transition: all .5s;
		height: 500px;
		width: 300px;
		padding: 20px;
		border: 1px solid #ddd;
		background-color: #efefef;
	}
	.active {
		left: 0px
	}

</style>