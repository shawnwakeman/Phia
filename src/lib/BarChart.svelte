<script lang="ts">
    


    import { onMount } from 'svelte';
    import type { Node } from "../types/collection"
    import * as d3 from 'd3';
    import { selectedNodeStore } from "../stores";
    import { selectedNodeId, nodesDataStore } from "../stores";
    import { supabase } from './supabaseClient'; 
    import {  get } from "svelte/store";


    

    const primcolor = "red"
    type WritableNode = {
    id: number
    name: string;
    value?: number | null;
    children?: WritableNode[];
    fillColor: string;
    
};


    
    let currentSelectedNodeId: number;
        selectedNodeId.subscribe(value => {
            currentSelectedNodeId = value;
        });
    
    function createHierarchy(data: Node[]): WritableNode | null {
    // Mapping object to store nodes by id for quick reference, and to track the parent-child relationships
    const elements: { [key: number]: WritableNode } = {};
  
    // Temporary variable to hold identified root node(s)
    let rootCandidates: WritableNode[] = [];
  
    data.forEach((d) => {
        const element: WritableNode = { id : d.id, name: d.name, value: d.value, children: [], fillColor: primcolor };
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
    const cleanChildren = (node: WritableNode) => {
        if (node.children && node.children.length === 0) {
            delete node.children;
        } else {
            node.children?.forEach(cleanChildren);
        }
    };
  
    cleanChildren(root);
    
    return root;
}
    

function deleteNode(root: WritableNode | null, nodeId: number): WritableNode | null {
    if (!root) return null; // If the root is null, there's nothing to delete

    // Handle root node deletion separately if needed
    if (root.id === nodeId) {
        // Implement desired behavior for root deletion with children
        // For simplicity, return null indicating the tree is empty or define other logic
        return null;
    }

    // Recursive function to traverse and delete the node
    function deleteNodeRecursive(currentNode: WritableNode, nodeId: number): boolean {
        if (!currentNode.children) return false;

        for (let i = 0; i < currentNode.children.length; i++) {
            if (currentNode.children[i].id === nodeId) {
                // Node found, delete it
                currentNode.children.splice(i, 1);
                return true; // Node deleted
            } else {
                // Recursively search for the node in children
                if (deleteNodeRecursive(currentNode.children[i], nodeId)) {
                    return true; // Node found and deleted in a deeper level
                }
            }
        }

        return false; // Node not found in this path
    }

    // Start the recursive deletion from root
    deleteNodeRecursive(root, nodeId);

    return root; // Return the modified tree
}

function updateNode(root: WritableNode | null, updatedNode: Node): WritableNode | null {
    if (!root) return root; // If the root is null, there's nothing to update

    // Traverse the hierarchy to find the node and update it
    const traverseAndUpdate = (node: WritableNode) => {
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

function findNodeById(node: d3.HierarchyCircularNode<WritableNode> | null, id: string): d3.HierarchyCircularNode<WritableNode> | null {
    if (!node) return null;
    if (node.id === id) return node;

    if (node.children) {
        for (const child of node.children) {
            const result = findNodeById(child as d3.HierarchyCircularNode<WritableNode>, id);
            if (result) return result;
        }
    }

    return null;
}

function updateHierarchy(root: WritableNode | null, newNode: Node): WritableNode | null {
    const newWrittableNode: WritableNode = { id: newNode.id, name: newNode.name, value: newNode.value, children: [], fillColor: primcolor };

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
    function findParentNode(node: WritableNode, parentId: number): WritableNode | null {
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

    let data: WritableNode | null;


        

    onMount(async () => {


   
        const unsubscribe = nodesDataStore.subscribe((value) => {
        console.log(value);
        
            data = createHierarchy(value)
        }); // logs 'got a subscriber', then '1'
        unsubscribe(); // logs 'no more subscribers'
    

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
            case 'UPDATE': {
                // Extract and cast the necessary properties from payload.new
                const updatedNode: NodePayload = payload.new as NodePayload;

                data = updateNode(data, updatedNode); // Implement this function

                break;
            }
            case 'DELETE': {
                // For delete, payload.old might contain the deleted node's data
                console.log("deleting ", payload.old)
                const deletedNode: NodePayload = payload.old as NodePayload; // Adjust as necessary

                data = deleteNode(data, deletedNode.id); // Implement this function
                console.log("After delete", data);
                break;
            }
            default:
                console.warn("Unhandled event type:", payload.eventType);
        }
        updateVisuals(); // Refresh the UI or visualization as needed
    }

    const channels = supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, handleRealtimeEvent)
    .subscribe();





    const width: number = 600;
    const height: number = 600;


    // Create SVG element
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });


    
    const svg = d3.select("#circle-packing")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "sans-serif");


    // Initialize zoom behavior

    svg.call(zoom as any);


    const g = svg.append("g");

    const centerX = (width - width * 0.8) / 2;
    const centerY = (height - height * 0.8) / 2;

    // Set the default zoom level to 80% and center it
    const initialTransform = d3.zoomIdentity.translate(centerX, centerY).scale(0.8);
    svg.call(zoom.transform, initialTransform); 

    
    if (data === null) {
        console.error("Failed to create hierarchical data.");
        return; // or return some fallback value if needed
    }


        const root: d3.HierarchyNode<WritableNode> = d3.hierarchy<WritableNode>(data)
        const pack = d3.pack<WritableNode>()
        const nodes = pack(root);

        

 
    // Prepare the data for visualization




    let selectedNode: d3.HierarchyCircularNode<WritableNode> | null = nodes;

    let currentDepth = 0;


    // Stack to keep track of zoom levels


    function updateVisuals() {
    if (!data) {
        console.error("Failed to create hierarchical data.");
        return;
    }

    const rootPadding = 20; // Extra padding for the root node
    const childNodePadding = 5; // Extra padding for nodes with children

// Calculate the hierarchy with adjusted values for nodes with children
const root = d3.hierarchy<WritableNode>(data)
    .sum(d => {
        // Assume each child adds an extra value to the parent to ensure more space
        let additionalValue = 0;
        if (d.children && d.children.length > 0) {
            additionalValue = d.children.length * 10; // Tune this based on your dataset
        }
        return (d.value ?? 0) + additionalValue;
    })
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

// Pack layout with dynamic padding based on node characteristics
// Adjust the pack layout to include conditional padding based on node properties
const pack = d3.pack<WritableNode>()
    .size([width, height])
    // Apply different padding based on whether a node has children and is not the root

    .padding(d => {
        if (d.depth > 1 && d.children) { // For non-root nodes with children
            return 6; // Increased padding for nodes with children
        } else if (d.depth === 1) { // For direct children of the root node
            return 6; // Standard padding for root's direct children
        } else if (d.depth < 1) {
            return 8; // Minimal padding for leaf nodes
        } else {
            return 3;
        }
    });


// Apply the pack layout to your hierarchy
let nodes = pack(root);







    updateCircles(nodes);
    updateText(nodes);
}





function updateCircles(nodes: d3.HierarchyCircularNode<WritableNode>) {
  g.selectAll("circle")
    .data(nodes.descendants(), (d) => (d as d3.HierarchyCircularNode<WritableNode>).data.id)
    .join("circle")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("r", d => {
  // Check if a node is selected and ensure it's defined
    if (selectedNode && d) {
        // Display the circle if the depth difference is less than 3
        // This condition assumes selectedNode and d are defined and have a depth property
        return Math.abs(selectedNode.depth - d.depth) < 3 ? d.r : 0;
    } else {
        // If no node is selected, or if there's an issue with the selectedNode or d, set a default
        // This could be 0 (to hide) or d.r (or another logic) to show circles
        return d.r; // or another default logic based on your requirements
    }
    })

// Radius is calculated by D3, taking into account the dynamic padding
    .attr("fill", d => d.data.fillColor)
    .attr("stroke", d => d.data.id === currentSelectedNodeId ? "red" : "blue")
    .attr("class", d => d.data.id === currentSelectedNodeId ? "circle-selected" : "circle")
    .on("click", (event, d) => {
      event.stopPropagation();
      handleCircleClick(d);

      
    });
}


function convertToNodeType(d3Node: d3.HierarchyCircularNode<WritableNode> | null): Node | null {
  if (d3Node === null) {
    return null; // or return a default NodeType object if preferred
  }

  // If d3Node is not null, proceed with conversion
  return {
    id: d3Node.data.id,
    name: d3Node.data.name,
    parent_id: d3Node.parent ? d3Node.parent.data.id : null,
    value: d3Node.value ?? null,
  };
}


function handleCircleClick(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0
        console.log(selectedNode?.depth);


        let allowClick = false;
        console.log(currentDepth);
        console.log(d.depth);
        if (d.depth - currentDepth < 2) {
            allowClick = true;
        } else if (d.depth === 0) {
            allowClick = true;
        }

        allowClick = true

        
        
        if (!d.children || d.children.length === 0) {

            if (selectedNode && d.data.id === selectedNode.data.id) {
                // Reset selection and zoom out
                const parent = nodes.find(node => node.depth === 0 && node.parent === null) || null;
                selectedNode = parent
                currentDepth = 0;
                selectedNodeId.set(data?.id || 1)
                // Apply a zoom reset
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        } else {
            if ((!d.children || d.children.length === 0) && (data && d.parent && d.parent.data.id === data.id) ) {
                selectedNode = d
                selectedNodeId.set(d.data.id);
                
            } else {
                selectedNode = d
                selectedNodeId.set(d.data.id);
            }

            applyZoom(d)


        }
        
        
        
        selectedNodeStore.set(convertToNodeType(selectedNode))

        
        updateVisuals();
        return; // Exit the function early
    }

    // Check if the clicked node is the currently selected node
    if (selectedNode && d.data.id === selectedNode.data.id) {
        // Reset selection and zoom out
        const parent = nodes.find(node => node.depth === 0 && node.parent === null) || null;
        selectedNode = parent
        currentDepth = 0;
        selectedNodeId.set(data?.id || 1)
        
        // Apply a zoom reset
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    } else {
        // Update the selected node and current depth for a new selection
        selectedNode = d;
        currentDepth = d.depth;
        selectedNodeId.set(d.data.id);
        // Calculate and apply zoom transformation for the new selection
        applyZoom(d);
        
    }

    // selectedNodeId.set(d.data.id)
    console.log("123" , selectedNode);
    
    selectedNodeStore.set(convertToNodeType(selectedNode))
    // Refresh visuals with the updated selection or reset
    updateVisuals();
}


function applyZoom(d: d3.HierarchyCircularNode<WritableNode>) {
    if (!selectedNode) {
        // Reset zoom if no node is selected
        svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity);
        return;
    }

    // Compute the zoom transformation based on the selected node 'd'
    const targetDiameter = Math.min(width, height) * 0.9;
    const scale = targetDiameter / (d.r * 2);
    const translate = [width / 2 - scale * d.x, height / 2 - scale * d.y];
    // Here, 'transform' is declared and assigned before its use
    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

    // Now 'transform' is already assigned and can be safely used
    svg.transition().duration(750).call(zoom.transform as any, transform);
}



function updateText(nodes: d3.HierarchyCircularNode<WritableNode>) {
    g.selectAll("text").remove();
    g.selectAll("text")
    .data(nodes.descendants().filter(d => d.depth === currentDepth + 1), d => (d as d3.HierarchyCircularNode<WritableNode>).data.name)
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

// Setup zoom behavior




// Initialize the visualization
updateVisuals();

   

svg.on("wheel.zoom", event => event.preventDefault())
    .on("dblclick.zoom", null) ;



  });

</script>




<div id="circle-packing"></div>




<style>

    :global(.circle) {
        stroke: #fff;

    }
    :global(.circle-selected) {

        stroke: #000;
        stroke-width: 2px;
    }
    
  </style>