<script lang="ts">
    import { onMount } from 'svelte';
    import { select } from 'd3';
    import type { Selection } from 'd3';
  
    let svg: SVGSVGElement;
  
    onMount(() => {
      const data: number[] = [5, 15, 30, 2, 20]; // Sample data
      const width: number = 400;
      const barHeight: number = 20;
  
      const chart: Selection<SVGSVGElement, unknown, null, undefined> = select(svg)
        .attr('width', width)
        .attr('height', barHeight * data.length);
  
      const bar = chart.selectAll('g')
        .data(data)
        .enter().append('g')
        .attr('transform', (d, i) => `translate(0,${i * barHeight})`);
  
      bar.append('rect')
        .attr('width', d => d * 10) // Scale data
        .attr('height', barHeight - 1);
  
      bar.append('text')
        .attr('x', d => d * 10 - 3)
        .attr('y', barHeight / 2)
        .attr('dy', '.35em')
        .text(d => d);
    });
  </script>
  
  <svg bind:this={svg}></svg>
  