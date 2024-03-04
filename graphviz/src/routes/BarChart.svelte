<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';


    let pullStrength: number = 0.02
    const numNodes: number = 5;


    interface Node {
        radius: number;
        value: number;
        x?: number;
        y?: number;
        vx: number ; // Add velocity in the x direction
        vy: number; // Add velocity in the y direction
        color?: string;

    }
    

    onMount(() => {
    const width: number = 1000, height: number = 1000;

    
    const colorScale: string[] = ['orange', 'lightblue', '#B19CD9'];
      
    d3.select('svg')
    .attr('width', width)
    .attr('height', height);

    
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
        radius: 153,
        value: Math.random(),
        color: colorScale[i % colorScale.length],
        x,
        y,
        vx: 0,
        vy: 0,
      };
    });


    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
    // .force('x', d3.forceX().x(width / 2).strength(pullStrength))
    // .force('y', d3.forceY().y(height / 2).strength(pullStrength))
    .force('collision', d3.forceCollide().radius((d: any) => d.radius).strength(.5))
    .on('tick', ticked);

    // Function to gradually increase the centering force strength
    function updateForces() {
      
      // pullStrength = Math.min(0.1, 0.0001 + pullStrength); // Gradually increase to a max of 0.1
      
      // console.log(pullStrength);

      // simulation.force('x', d3.forceX().x(width / 2).strength(pullStrength));
      // simulation.force('y', d3.forceY().y(height / 2).strength(pullStrength));
    }

    simulation.on('tick', () => {
      ticked();
      updateForces(); // Update forces on each tick
      applyCustomCenteringForce(simulation.alpha());
    });

    function ticked() {
      const u = d3.select('svg g')
        .attr('width', width)
        .attr('height', height)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', (d: Node) => d.radius)
        .attr('cx', (d: Node) => d.x ?? 0)
        .attr('cy', (d: Node) => d.y ?? 0);
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


      });
    }



  });

   
  
</script>


    


<svg>
  <g></g>
</svg>

<style>

</style>