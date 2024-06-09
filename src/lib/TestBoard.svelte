<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    
    type WritableNode = {
    id: number
    name: string;
    value?: number | null;
    children?: WritableNode[];
    fillColor: string;
    state: string;
    totalPriority: number
    innerGradientStop: string;
    outerGradientStop: string;
    
};

    let data = {
        name: 'root',
        children: [
            { name: 'A', value: 100 },
            { name: 'B', value: 200 },
            { name: 'C', value: 300 },
            { name: 'D', value: 400 }
        ]
    };

    let width = 800;
    let height = 800;
    let nodes: any;

    function customCirclePack(rootNode: d3.HierarchyNode<WritableNode>, containerRadius: number) {
    // Define the container circle
        rootNode.r = containerRadius;
        
        // Flatten the nodes and calculate the radius for each based on the total value
        const leaves = rootNode.leaves();
        const totalValue = d3.sum(leaves, d => d.value ?? 0);

        leaves.forEach(node => {
            node.r = Math.sqrt((node.value ?? 0) / totalValue) * containerRadius;
        });

        // Position the circles using a simple packing algorithm
        let currentAngle = 0;
        leaves.forEach(node => {
            node.x = Math.cos(currentAngle) * (containerRadius - node.r);
            node.y = Math.sin(currentAngle) * (containerRadius - node.r);
            currentAngle += Math.asin(node.r / containerRadius) * 2; // Adjust the angle based on the radius
        });

        return rootNode;
    }

    onMount(() => {
        const root = d3.hierarchy<WritableNode>(data)
            .sum(d => d.value ?? 0);

        const containerRadius = Math.min(width, height) / 2;
        nodes = customCirclePack(root, containerRadius);

        drawCircles(nodes);
    });

    function drawCircles(rootNode: d3.HierarchyNode<WritableNode>) {
        const svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        g.selectAll('circle')
            .data(rootNode.leaves())
            .enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)
            .style('fill', 'steelblue');
    }
</script>

<svg></svg>
