<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';



    let pullStrength: number = 0.02
    const numNodes: number = 100;

    let svg: SVGSVGElement | null = null;
    let selectedNode: Node | null = null;

    interface Node {
        
        radius: number;
        value: number;
        x?: number;
        y?: number;
        vx: number ; // Add velocity in the x direction
        vy: number; // Add velocity in the y direction
        color: string;
        fx?: number | null; // Fix x position during drag
        fy?: number | null; // Fix y position during drag

    }
    

    onMount(() => {
      const width: number = 1000, height: number = 1000;

    //   if (!svg) return; // Ensure svg is not null

    // const zoom = d3.zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([1, 10]) // Limits zooming between 1x and 10x
    //   .on('zoom', (event) => {
    //     // Ensure svg is not null and apply the transform
    //     if (svg) d3.select(svg).select('g').attr('transform', event.transform);
    //   });
    //   // Select the SVG element (using D3 or the bound variable) and call zoom
    //   d3.select(svg).call(zoom);
      
      const colorScale: string[] = ['orange', 'lightblue', '#B19CD9'];
        
      const svg = d3.create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
  

    
      const nodes: Node[] = d3.range(numNodes).map((d, i) => {
        
      // Define the circle's center
      const centerX = width / 2;
      const centerY = height / 2;

      // Define the radius of the circle where the nodes will be placed
      // This should be smaller than the SVG width/height to fit all nodes
      const placementRadius = Math.min(width, height) / 3 * Math.random(); // Adjust as needed

      // Distribute nodes evenly in a circle
      const angle = (i / numNodes) * 2 * Math.PI; // Even distribution of angles in radians

      // Convert polar coordinates (angle, placementRadius) to Cartesian coordinates (x, y)
      const x = centerX + placementRadius * Math.cos(angle);
      const y = centerY + placementRadius * Math.sin(angle);

      return {
        radius: 10,
        value: Math.random(),
        color: colorScale[i % colorScale.length + 1],
        x,
        y,
        vx: 0,
        vy: 0,
      };
    });


    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
    // .force('x', d3.forceX().x(width / 2).strength(pullStrength))
    // .force('y', d3.forceY().y(height / 2).strength(pullStrength))
    .force('collision', d3.forceCollide().radius((d: any) => d.radius).strength(.8))
    .on('tick', ticked);

    // Function to gradually increase the centering force strength
    function updateForces() {
      
      // pullStrength = Math.min(0.1, 0.0001 + pullStrength); // Gradually increase to a max of 0.1
      
      // console.log(pullStrength);

      // simulation.force('x', d3.forceX().x(width / 2).strength(pullStrength));
      // simulation.force('y', d3.forceY().y(height / 2).strength(pullStrength));
    }

    const config = {
      colour: 'yellow'
    }


    simulation.on('tick', () => {
      ticked();
      updateForces(); // Update forces on each tick
      applyCustomCenteringForce(simulation.alpha());
      
    });

    function ticked() {
      const circles = d3.select('svg g').selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', d => d.radius)
        .attr('cx', d => d.x ?? 0)
        .attr('cy', d => d.y ?? 0)
        .attr('fill', d => d.color)
    
        // Apply hover effects directly using D3
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .attr('stroke', 'rgb(248, 0, 0)')
            .attr('stroke-width', '2');
        })
        .on('mouseleave', function(event, d) {
          d3.select(this)
            .attr('stroke', null)
            .attr('stroke-width', null);
        })

        .style('opacity', d => selectedNode && d !== selectedNode ? 0.5 : 1)
        .on('click', (event, d) => {
          selectedNode = d;
          circles.style('opacity', d => selectedNode && d !== selectedNode ? 0.5 : 1);

        });
    }

    function applyCustomCenteringForce(alpha: number) {
      nodes.forEach(node => {
        // Provide default values for x and y if they are undefined
        let nodeX = node.x || width / 2; // Default to center if undefined
        let nodeY = node.y || height / 2; // Default to center if undefined

        let radiusBasedStrength = node.radius / 10 * pullStrength;

        // Use the safe values of nodeX and nodeY in your calculations
        node.vx += (width / 2 - nodeX) * radiusBasedStrength * alpha;
        node.vy += (height / 2 - nodeY) * radiusBasedStrength * alpha;
        // simulation.alphaTarget(0.3).restart(); //TODO: fix

      });
    }

    // Drag functions
  });

   
  
</script>


    

<h2>
  {#if selectedNode}
    Selected Node ID: {selectedNode.radius} - Value: {selectedNode.value.toFixed(2)}
  {:else}
    Click on a node to select it.
  {/if}

</h2>

<svg bind:this={svg} width="1000" height="1000">
  <g></g>
</svg>

