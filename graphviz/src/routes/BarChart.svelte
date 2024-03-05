<script lang="ts">
// chart to display issues




  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import anime from 'animejs';

  interface Node {
    name: string;
    value?: number;
    children?: Node[];
  }


  // Generating dummy hierarchical data
  const data: Node = {
    name: "root",
    children: [
      {
        name: "group1",
        children: [
          { name: "node1", value: 10 },
          { name: "node2", value: 15 },
          { name: "node3", value: 5 },
        ],
      },
      {
        name: "group2",
        children: [
          { name: "node4", value: 8 },
          { name: "node5", value: 12 },
        ],
      },
      { name: "node6", value: 20 },
    ],
  };



onMount(() => {
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
    

    // Prepare the data for visualization
    const root: d3.HierarchyNode<Node> = d3.hierarchy<Node>(data)
      .sum(d => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<Node>()
      .size([width - 2, height - 2])
      .padding(3);

    // Apply the pack layout to the root hierarchy. The explicit typing of `root` helps TypeScript understand the expected type.
    const nodes = pack(root);

    interface ZoomState {
      transform: d3.ZoomTransform;
    }

    let lastClickedNode: d3.HierarchyCircularNode<Node> | null = null;

    let currentDepth = 0;


    // Stack to keep track of zoom levels
    let zoomStack: ZoomState[] = [];


  function updateText() {

    console.log(currentDepth)

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
        console.log(currentDepth)
        
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
  
