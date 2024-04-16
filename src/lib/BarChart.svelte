<script lang="ts">
    


    import { onMount } from 'svelte';
    import type { Node } from "../types/collection"
    import * as d3 from 'd3';
    import { selectedNodeStore } from "../stores";
    import { selectedNodeId, nodesDataStore } from "../stores";

    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    const primcolor = "red"
    type WritableNode = {
    id: number
    name: string;
    value?: number | null;
    children?: WritableNode[];
    fillColor: string;
    
};

        
    
    let currentZoomScale = 1; // Global variable to track zoom scale
    let currentSelectedNodeId: number;
        selectedNodeId.subscribe(value => {
            currentSelectedNodeId = value;
        });


        
    let nodes;    
    
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
  
    data.forEach((d) => {
        if (d.parent_id !== null && elements[d.parent_id]) {
            elements[d.parent_id].children!.push(elements[d.id]);
        }
    });

    // Recalculate child values after hierarchy is built
    Object.values(elements).forEach((element) => {
       
       if (element.children && element.children.length > 0) {
           

      
           
           const childValue = element.value / element.children.length / 2 ;
           const totalChildValue = element.children.reduce((acc, child) => acc + child.value, 0);

           
           element.children.forEach((child) => {
            if (totalChildValue > 1) {
                child.value = (child.value / totalChildValue) * element.value / 2;
            } else {
                // If totalChildValue is zero, distribute parent's value equally
                child.value = element.value ;
            }
               
           });
       } else {
            element.value
        
       }
   });


    console.log("Node ID and Values after calculations:");
    Object.values(elements).forEach((element) => {
        console.log(`Node ID: ${element.id}, Value: ${element.value}`);
    });

    return rootCandidates[0]; // Return the root node
}
    



    let data: WritableNode | null;


    let currentZoomLevel = 1;

    let isFirstLoad = true; 
    let isFirstLoad2 = true; 
    onMount(async () => {


   
        const unsubscribe = nodesDataStore.subscribe((value) => {
        console.log(value);
        
            data = createHierarchy(value)
            if (!isFirstLoad) {
                updateVisuals();
            }
            isFirstLoad = false; // Update flag after first run
        }); // logs 'got a subscriber', then '1'
 
    


// Assuming the payload structure is known and matches the Node interface
// Adjust the types as necessary to match your actual data structure
    




    const width: number = 600;
    const height: number = 600;
    let okay = false;

    // Create SVG element
    const zoom = d3.zoom<SVGSVGElement, unknown>()
  
    .on("zoom", (event) => {
        g.attr("transform", event.transform)

        currentZoomLevel = event.transform.k;
        console.log('Current zoom scale:', event.transform.k);
        if (okay) {
            updateVisuals()
            
        } else {
            okay = true
        }
            
    });


    
    const svg = d3.select("#circle-packing")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
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

    console.log("Root with value sum and sort:", data);
const root = d3.hierarchy<WritableNode>(data)
    .sum(d => d.value ?? 0) // Only use the node's own value
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)); // Keep sorting if needed


const pack = d3.pack<WritableNode>()
    .size([width, height])
    .padding(d => {
        // Keep your dynamic padding logic
        if (d.depth < 4 && d.children) {
            return 0; // Adjust padding for non-root nodes with children
        } else if (d.depth === 1) {
            return 6; // Consistent padding for root's direct children
        } else if (d.depth === 0) {
            return 8; // Slightly larger padding for the root node
        } 
        else {
            return 0; // Minimal padding for leaf nodes
        }
    });

nodes = pack(root);


// Apply the pack layout to your hierarchy








    updateCircles(nodes);
    updateText(nodes);
}




    function updateCircles(nodes: d3.HierarchyCircularNode<WritableNode>) {

        
  g.selectAll("circle")
    .data(nodes.descendants(), (d) => (d as d3.HierarchyCircularNode<WritableNode>).data.id)
    .join("circle")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("r", d => d.r)

// Radius is calculated by D3, taking into account the dynamic padding
    .attr("fill", d => d.data.fillColor)
    .attr("stroke-width", d => 1/ d.depth)  // Decrease stroke-width with depth
    .attr("class", d => {
    // Add 'circle' class to all, 'circle-selected' if it is the selected node
        let classes = d.data.id === currentSelectedNodeId ? "circle circle-selected" : "circle";
        // Add 'hoverable' class only if the node has children
        if (d.children || d.depth == 1) {
        classes += " hoverable";
        } else if (d.parent?.data.id == $selectedNodeStore?.id) {
            classes += " hoverable";
        }
        return classes;
    })
    .on("click", (event, d) => {
      event.stopPropagation();

      if (d.children != null || d.depth == 1) {
        handleCircleClick(d);
      } else if (d.parent?.data.id == $selectedNodeStore?.id) {
        handleCircleClickInternal(d)
      
        
      } else {
            handleCircleClickFarNode(d)
      }
 

      
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

function handleCircleClickInternal(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0
        console.log(selectedNode?.depth);


    // Check if the clicked node is the currently selected node
        if (!d.children || d.children.length === 0) {

            if (selectedNode && d.data.id === selectedNode.data.id) {
                // Reset selection and zoom out
                currentDepth = 0;
                selectedNodeId.set(1)
                // Apply a zoom reset
                
        } else {

            selectedNode = d
            selectedNodeId.set(d.data.id);
         

         


        }
        
        selectedNodeStore.set(convertToNodeType(selectedNode))

        
        updateVisuals();
        return; // Exit the function early
    }
}

function handleCircleClickFarNode(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0
        console.log(selectedNode?.depth);


    // Check if the clicked node is the currently selected node
 

        if (selectedNode && d.data.id === selectedNode.data.id) {
                // Reset selection and zoom out
                
                
                currentDepth = 0;
                selectedNodeId.set(1)
                // Apply a zoom reset
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        } else {
           
            selectedNode = d.parent
            selectedNodeId.set(d.parent?.data.id);

            applyZoomToParent(d)


        }
        
        
        
        selectedNodeStore.set(convertToNodeType(selectedNode))

        
        updateVisuals();
        return; // Exit the function early
  
}

function applyZoomToParent(d: d3.HierarchyCircularNode<WritableNode>) {
    d = d.parent
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
        .attr("transform", d => {
          const scale = 1 / (d.depth); // Scale down text size as depth increases
          return `translate(${d.x},${d.y}) scale(${scale})`;
        })
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


updateVisuals();

svg.on("wheel.zoom", event => event.preventDefault())
    .on("dblclick.zoom", null) ;

    svg.on("dblclick.zoom", null);

            svg.on("mousedown.zoom", null)
           .on("mousemove.zoom", null)
           .on("mouseup.zoom", null)
           .on("touchstart.zoom", null)
           .on("touchmove.zoom", null)
           .on("touchend.zoom", null);
 });


 export let backgroundColor = '#fff'; // You can make this reactive too
    export let fontSize = 12; // Font size for labels

    let activeFocus = null;
    let rootData; // This should be your packed nodes data structure
    let zoomK = 1, zoomA = 0, zoomB = 0; // Controls for zoom level and translation

    // Function to handle zooming on a node
    function zoom(node, event) {
        event.stopPropagation();
        activeFocus = node;
        const k = height / (node.r * 2);
        zoomK = k;
        zoomA = node.x;
        zoomB = node.y;
    }


 

</script>



    <div id="circle-packing"></div>



<style>

    :global(.circle) {
        stroke: #000000;

    }
    :global(.circle-selected) {

        stroke: #000;

    }

    :global(.hoverable:hover, .circle-selected:hover) {
  
        stroke: green; /* change color on hover */
    }


    svg {
        shape-rendering: optimizeSpeed;
        image-rendering: optimizeSpeed;
    }

    
  </style>