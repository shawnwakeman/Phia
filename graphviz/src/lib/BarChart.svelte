<script lang="ts">
    
// chart to display issues
    import { onMount } from 'svelte';
    import type { Node } from "../types/collection"
    import * as d3 from 'd3';
    import anime from 'animejs';


    export let data1: { nodes: Node[] };



    type FlatNode = {
        id: number;
        name: string;
        parent_id: number | null;
        value: number | null;
    };

    type WrittableNode = {
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
        const element: WrittableNode = { name: d.name, value: d.value, children: [] };
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

// Example usage with TypeScript




    const data = createHierarchy(data1.nodes);

    console.log(JSON.stringify(data, null, 2));

    onMount(async () => {


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

    // Prepare the data for visualization
    const root: d3.HierarchyNode<WrittableNode> = d3.hierarchy<WrittableNode>(data)
        .sum(d => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<WrittableNode>()
        .size([width - 2, height - 2])
        
        .padding(10);

    // Apply the pack layout to the root hierarchy. The explicit typing of `root` helps TypeScript understand the expected type.
    const nodes = pack(root);

    interface ZoomState {
        transform: d3.ZoomTransform;
    }

    let lastClickedNode: d3.HierarchyCircularNode<WrittableNode> | null = null;

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



    const circles = g.selectAll("circle")
        .data(nodes.descendants())
        .join("circle")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("r", 0) // Initial radius set to 0 for animation
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("stroke", "#fff")
        .attr("class", "circle")
      
        .on("click", function(event, d) {
            if (event.defaultPrevented) return;

            if (lastClickedNode === d) {
            // If the same node is clicked again, reset the zoom

            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            lastClickedNode = null; // Reset last clicked node
            currentDepth = 0
            } else {
            // Zoom into the node
            const targetDiameter = Math.min(width, height) * 0.9;
            const scale = targetDiameter / (d.r * 2);
            const limitedScale = Math.min(Math.max(scale, zoom.scaleExtent()[0]), zoom.scaleExtent()[1]);
            const translate = [width / 2 - limitedScale * d.x, height / 2 - limitedScale * d.y];
            const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(limitedScale);
            svg.transition().duration(750).call(zoom.transform, transform);
            lastClickedNode = d; // Update last clicked node
            currentDepth = d.depth
            
            }
            event.stopPropagation();
            updateText(); // Prevent click event from propagating to svg
            
        
      });

      anime({
      targets: circles.nodes(), // Use .nodes() to get the actual DOM elements from D3 selection
      r: d => d.__data__.r, // Animate radius to final value, accessing __data__ to get original data bound by D3
      duration: 1000,
      easing: 'easeInOutSine',
      delay: anime.stagger(5) // Stagger the start times of each circle's animation
});



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
    fill: #495f3d; /* Example: Set text color */
    
  }

</style>
  
