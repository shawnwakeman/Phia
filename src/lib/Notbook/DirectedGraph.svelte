<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
import { writable } from 'svelte/store';
    let linkDistance = 50;
    
    let centerForce = 0.06

    let repelStrength = -100;

    export let nodes;
    export let files;

    // Links use numeric IDs for source and target
    let links = [];
    // let currentRootId = 1;
    // let newNodes = []
    if (nodes) {

 
        nodes.forEach(node => {
            if (node.id != 1) {
                
                links.push({ source: node.parent_id, target: node.id, level: 1 });

                
            }

            
            
            

        });

    //     files.forEach(file => {
    //     const newNodeId = Math.max(...nodes.map(n => n.id), ...newNodes.map(n => n.id)) + 1; // Generate a unique ID
    //     const newNode = { id: newNodeId, name: file.id, value: 5, parent_id: file.node_id };
    //     newNodes.push(newNode);
    //     links.push({ source: file.node_id, target: newNodeId, level: 1 });
    // });
    }
    // nodes = [...nodes, ...newNodes];

  
    onMount(() => {
    const width = 928;
    const height = 680;

    const forceX = d3.forceX().strength(0.06);
    const forceY = d3.forceY().strength(0.06);

        
    const repelStrengthLevel1 = -30;
    const repelStrengthLevel2 = -100;

    const forceCharge = d3.forceManyBody()
      .strength(repelStrength);
    // Initial setup of forces
    const simulation = d3.forceSimulation(nodes)

        .force("link", d3.forceLink(links).id(d => d.id)
            .distance(d => {
            // Set the link distance longer based on the level
            // Adjust the base distance and multiplier as needed
            // Base distance for links
            return linkDistance; // Increase distance based on level
            })
            )
        .force("charge", forceCharge)



        const zoom = d3.zoom()
        .scaleExtent([1 / 2, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

      const svg = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto;");
  


  ;

// Apply the zoom behavior to the SVG element
    svg.call(zoom);


    const g = svg.append("g");
  
      const link = g
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));
  
      const node = g
          .selectAll("circle")
          .data(nodes)
          .enter().append("circle")
            .attr("r", d => 5)
            .attr("fill", "#d00")
            .call(drag(simulation));



      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
  
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
      });
  
      function drag(simulation) {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;

        }
  
        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
  
        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
            forceX.strength(centerForce)
            forceY.strength(centerForce)

        }
  
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      }

   
      invalidation.then(() => simulation.stop());
    });



  </script>

<label>
    Link Distance: {linkDistance}
    <input type="range" min="0" max="200" bind:value={linkDistance}>
  </label>
  
 
  
  <label>
    Repel Force: {repelStrength}
    <input type="range" min="-100" max="0" bind:value={repelStrength}>
  </label>
  
  
  <div id="graph"></div>
  