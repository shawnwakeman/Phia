<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    interface Node {
        radius: number;
        value: number;
        x?: number;
        y?: number;
        color?: string;

    }
    

    onMount(() => {
    const width: number = 1000, height: number = 1000;

    
    const colorScale: string[] = ['orange', 'lightblue', '#B19CD9'];

    const numNodes: number = 50;
    const nodes: Node[] = d3.range(numNodes).map((d, i) => ({
      radius: Math.random() * 10,
      value: Math.random(),
      color: colorScale[i % colorScale.length], // Assign color based on index
    }));

    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('charge', d3.forceManyBody().strength(5))
      .force('x', d3.forceX().x(() => width/2))
      .force('y', d3.forceY().y(() => 100))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius))
      .on('tick', ticked);


    function ticked() {
      const u = d3.select('svg g')
        .attr('width', width)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', (d: Node) => d.radius)
        .attr('cx', (d: Node) => d.x ?? 0)
        .attr('cy', (d: Node) => d.y ?? 0);
    }
  });
</script>

<style>
    circle {
      color: #8b2424;
    }
</style>
    


<svg width="600" height="400">
  <g></g>
</svg>