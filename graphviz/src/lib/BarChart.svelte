<script lang="ts">
    
// chart to display issues
    import { onMount } from 'svelte';
    import type { Node } from "../types/collection"
    import * as d3 from 'd3';
    import anime from 'animejs';
    import { selectedNodeId } from "../stores";
    import { supabase } from './supabaseClient'; // Import your Supabase client
    export let data1: { nodes: Node[] };
    

    type FlatNode = {
        id: number;
        name: string;
        parent_id: number | null;
        value: number | null;
    };

    type WrittableNode = {
    id: number
    name: string;
    value?: number | null;
    children?: WrittableNode[];
};




    function createHierarchy(data: Node[]): WrittableNode | null {
    // Mapping object to store nodes by id for quick reference, and to track the parent-child relationships
    const elements: { [key: number]: WrittableNode } = {};
  
    // Temporary variable to hold identified root node(s)
    let rootCandidates: WrittableNode[] = [];
  
    data.forEach((d) => {
        const element: WrittableNode = { id : d.id, name: d.name, value: d.value, children: [] };
        elements[d.id] = element;
  
        if(d.parent_id === null) {
            rootCandidates.push(element); // Potential root node based on missing parent_id
        }
    });
  
    if (rootCandidates.length === 0) {
        console.error("No root node found in the data.");
        return null; // Return null if no root node is found
    } else if (rootCandidates.length > 1) {
        console.warn("Multiple root nodes found. Using the first one found as the root.");
    }
  
    // The actual root node
    let root = rootCandidates[0];
  
    data.forEach((d) => {
        if(d.parent_id !== null && elements[d.parent_id]) {
            elements[d.parent_id].children!.push(elements[d.id]);
        }
    });
  
    // Function to clean nodes without children by removing the empty 'children' arrays
    const cleanChildren = (node: WrittableNode) => {
        if (node.children && node.children.length === 0) {
            delete node.children;
        } else {
            node.children?.forEach(cleanChildren);
        }
    };
  
    cleanChildren(root);
  
    return root;
}


function deleteNode(root: WrittableNode | null, nodeId: number): WrittableNode | null {
    if (!root) return root; // If the root is null, there's nothing to delete

    // Special case: If the root is to be deleted and has no or one child
    if (root.id === nodeId) {
        console.warn("Root node deletion not handled.");
        return root; // Add logic here if you want to handle root deletion
    }

    const parentNode = findParentNode(root, nodeId);
    if (parentNode) {
        // Once the parent node is found, filter out the node to be deleted from its children
        parentNode.children = parentNode.children?.filter(child => child.id !== nodeId) ?? [];
    } else {
        console.error("Parent node not found for node with ID:", nodeId);
    }

    return root;
}

function updateNode(root: WrittableNode | null, updatedNode: Node): WrittableNode | null {
    if (!root) return root; // If the root is null, there's nothing to update

    // Traverse the hierarchy to find the node and update it
    const traverseAndUpdate = (node: WrittableNode) => {
        if (node.id === updatedNode.id) {
            node.name = updatedNode.name;
            node.value = updatedNode.value;
            return;
        }

        node.children?.forEach(traverseAndUpdate);
    };

    traverseAndUpdate(root);

    return root;
}


// Example usage with TypeScript

function updateHierarchy(root: WrittableNode | null, newNode: Node): WrittableNode | null {
    const newWrittableNode: WrittableNode = { id: newNode.id, name: newNode.name, value: newNode.value, children: [] };
    console.log("asd")
    // If the newNode should be a new root
    if(newNode.parent_id === null) {
        
        if (root === null) {
            // New node becomes the root if there's no existing root
            return newWrittableNode;
        } else {
            // Logic to handle multiple root nodes situation
            // For simplicity, we just log a message here. Adjust based on your requirements.
            console.warn("Multiple root nodes. Existing root maintained.");
            return root;
        }
    } else {
        // Only proceed if root is not null
        if (root) {
            // Find and add the new node to its parent
            const parentNode = findParentNode(root, newNode.parent_id);
            if (parentNode) {
                parentNode.children = parentNode.children ? [...parentNode.children, newWrittableNode] : [newWrittableNode];
            } else {
                console.error("Parent node not found for new node with parent_id:", newNode.parent_id);
            }
        } else {
            // Handle the case when there's no root but the new node has a parent_id (which is a data inconsistency)
            console.error("Attempted to add a child node to a null root with parent_id:", newNode.parent_id);
        }
    }
    
    return root;
}

// The rest of the functions remain unchanged.


// Helper function to recursively find the parent node
    function findParentNode(node: WrittableNode, parentId: number): WrittableNode | null {
        if (node.id === parentId) {
            return node;
        }
        
        for (const child of node.children || []) {
            const found = findParentNode(child, parentId);
            if (found) {
                return found;
            }
        }
        
        return null; // Parent node not found
    }

    let data = createHierarchy(data1.nodes);

    console.log(JSON.stringify(data, null, 2));

        onMount(() => {

    interface RealtimePostgresInsertPayload<T> {
        eventType: string;
        new?: T;
        old?: T;
    }

    interface NodePayload {
    id: number;
    name: string;
    value: any; // Adjust based on the actual type of 'value'
    parent_id: number | null;
}

// Assuming the payload structure is known and matches the Node interface
// Adjust the types as necessary to match your actual data structure
    function handleRealtimeEvent(payload: RealtimePostgresInsertPayload<{ [key: string]: any }>) {
        switch (payload.eventType) {
            case 'INSERT': {
                // Extract and cast the necessary properties from payload.new
                console.log("insering", payload.new)
                const newNode: NodePayload = payload.new as NodePayload;
                // Assuming you have a way to access and update the root of your hierarchy
          
                data = updateHierarchy(data, newNode);

                break;
            }
            // case 'UPDATE': {
            //     // Extract and cast the necessary properties from payload.new
            //     const updatedNode: NodePayload = payload.new as NodePayload;

            //     data = updateNode(data, updatedNode); // Implement this function

            //     break;
            // }
            // case 'DELETE': {
            //     // For delete, payload.old might contain the deleted node's data
            //     console.log("deleting ", payload.old)
            //     const deletedNode: NodePayload = payload.old as NodePayload; // Adjust as necessary

            //     data = deleteNode(data, deletedNode.id); // Implement this function
            //     console.log("After delete", data);
            //     break;
            // }
            // default:
            //     console.warn("Unhandled event type:", payload.eventType);
        }
        updateCircles(); // Refresh the UI or visualization as needed
    }

    const channels = supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, handleRealtimeEvent)
    .subscribe();





    const width: number = 600;
    const height: number = 600;


    // Create SVG element
    const svg = d3.select("#circle-packing")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "sans-serif");


    // Initialize zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

    svg.call(zoom);


    const g = svg.append("g");

    
    if (data === null) {
        console.error("Failed to create hierarchical data.");
        return; // or return some fallback value if needed
    }


        const root: d3.HierarchyNode<WrittableNode> = d3.hierarchy<WrittableNode>(data)
        .sum(d => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        const pack = d3.pack<WrittableNode>()
        .size([width - 2, height - 2])
        
        .padding(10);

    // Apply the pack layout to the root hierarchy. The explicit typing of `root` helps TypeScript understand the expected type.
        const nodes = pack(root);

 
    // Prepare the data for visualization


    interface ZoomState {
        transform: d3.ZoomTransform;
    }

    let selectedNode: d3.HierarchyCircularNode<WrittableNode> | null = null;

    let currentSelectedNodeID: number = 13;

    let currentDepth = 0;


    // Stack to keep track of zoom levels
    let zoomStack: ZoomState[] = [];


  function updateText() {

    

    g.selectAll("text").remove();
    g.selectAll("text")
    .data(nodes.descendants().filter(d => d.depth === currentDepth + 1), d => d.data.name)
    .join(
      enter => enter.append("text")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("opacity", 0) // Start fully transparent
        .text(d => d.data.name)
        .attr("class", "text")
        .call(enter => enter.transition()
        .duration(750)
        .attr("opacity", 1)), // Animate to fully opaque
      update => update.call(update => update.transition()
        .duration(750)), // Optional: animate updates
      exit => exit.call(exit => exit.transition()
        .duration(750)
        .attr("opacity", 0) // Animate to fully transparent
        .remove())
    );

  }




   
function updateCircles() { 

    if (data === null) {
        console.error("Failed to create hierarchical data.");
        return; // or return some fallback value if needed
    }

    const root: d3.HierarchyNode<WrittableNode> = d3.hierarchy<WrittableNode>(data)
        .sum(d => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        const pack = d3.pack<WrittableNode>()
        .size([width - 2, height - 2])
        
        .padding(10);

    // Apply the pack layout to the root hierarchy. The explicit typing of `root` helps TypeScript understand the expected type.
        const nodes = pack(root);
    const circles = g.selectAll("circle")
        .data(nodes.descendants())
        .join("circle")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("r", d => d.r) // Initial radius set to 0 for animation
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("stroke", d => d.data.id === selectedNode?.data.id ? "red" : "blue")
        .attr("class", d => d.data.id === selectedNode?.data.id ? "circle-selected" : "circle")
        .on("click", function(event, d) {
            d3.selectAll(".circle-selected").attr("class", "circle"); // Reset class for previously selected circles
            
            if (event.defaultPrevented) return;

            if (selectedNode === d) {
            // If the same node is clicked again, reset the zoom
                selectedNode = null
                selectedNodeId.set(1);
                g.selectAll("circle").attr("class", "circle");
                g.select("circle[data-id='1']").attr("class", "circle-selected");
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
                

            currentDepth = 0
            } else {
                d3.select(this).attr("class", "circle-selected");
            // Zoom into the node
            const targetDiameter = Math.min(width, height) * 0.9;
            const scale = targetDiameter / (d.r * 2);
            const limitedScale = Math.min(Math.max(scale, zoom.scaleExtent()[0]), zoom.scaleExtent()[1]);
            const translate = [width / 2 - limitedScale * d.x, height / 2 - limitedScale * d.y];
            const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(limitedScale);
            svg.transition().duration(750).call(zoom.transform, transform);
            selectedNode = d; // Update last clicked node
            selectedNodeId.set(d.data.id);
            currentDepth = d.depth

            }

      
            console.log("d",d.data.id)
            

            event.stopPropagation();
            updateText(); // Prevent click event from propagating to svg
            
        
      });
  
    }


updateCircles()


// Add text to circles, only one level deep
 // Prevents text from interfering with click events

// Reset zoom when clicking outside of any circle

updateText()

svg.on("wheel.zoom", event => event.preventDefault())
    .on("dblclick.zoom", null) ;



  });

</script>




<div id="circle-packing"></div>




<style>
    :global(.circle) {
      fill: #495f3d; /* Default fill color */
    }
  
    :global(.circle-selected) {
      fill: #f00; /* Highlighted fill color */
      stroke: #000;
      stroke-width: 2px;
    }
  </style>