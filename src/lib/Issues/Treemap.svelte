<script lang="ts">
    import { onMount } from 'svelte';
    import type { Node, Issue } from "../../types/collection";
    import { selectedNodeStore, nodesDataStore, issuesDataStore } from "../../stores";
    import { get } from "svelte/store";
    import * as d3 from 'd3';
  


    function buildHierarchy(nodes: Node[], issues: Issue[]) {
      
        
        
        const nodeMap = new Map(nodes.map(node => [node.id, { 
            id: node.id, 
            name: node.name, 
            parent_id: node.parent_id, 
            children: [] 
        }]));

        // Transform issues and add to corresponding nodes
        issues.forEach(issue => {
            const issueTransformed = {
                ...issue,
                value: 5, // Set value for issues only
                children: [] // Assuming issues might have children
            };
            if(nodeMap.has(issue.node_id)) {
                nodeMap.get(issue.node_id).children.push(issueTransformed);
            }
        });

        // Construct hierarchical structure
        let hierarchy = {
            name: "Root",
            children: []
        };

        nodes.forEach(node => {
            if(node.parent_id === null) {
                hierarchy.children.push(nodeMap.get(node.id));
            } else if(nodeMap.has(node.parent_id)) {
                nodeMap.get(node.parent_id).children.push(nodeMap.get(node.id));
            }
        });

        return hierarchy;
    }

    let issues: Issue[] = []
    let nodes: Node[] = []

    
    $: if ($issuesDataStore) {
        updateIssuesAndNodes();
    }


    async function updateIssuesAndNodes() {
    // Assuming the current state of issuesDataStore influences both issues and nodes,
    // and fetchNodesBasedOnIssues is a function you define to fetch nodes based on the current issues.
    try {

        // Optionally, update local component state if necessary.
        issues = get(issuesDataStore);
        nodes = get(nodesDataStore);
            
            const data = buildHierarchy(nodes, issues);
       
            
            drawTreeMap(data); // Assuming drawTreeMap() takes the hierarchy data as an argument
           
  
            
        } catch (error) {
        console.error("Failed to update issues and nodes:", error);
        }


    }
    

    onMount(() => {
    updateIssuesAndNodes();
  });


  
  function drawTreeMap(data) {
        const width = 600; // Adjusted from 800
        const height = 200; // Adjusted from 600

        const format = d3.format(",d");
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const treemap = data => d3.treemap()
            .size([width, height])
            .paddingOuter(3)
            .paddingTop(19)
            .paddingInner(1)
            .round(true)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

        const root = treemap(data);

        const svg = d3.select("#treemap")
        .attr("viewBox", [0, 0, width, height])
        .style("font", "10px sans-serif");

        
        svg.selectAll("*").remove()
        const nodes = svg.selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

nodes.append("rect")
    .attr("fill", d => color(d.depth))
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

// Adding text for all nodes
nodes.append("text")
    .selectAll("tspan")
    .data(d => {
        // Splitting the name for leaf nodes, and using the full name for others
        const parts = d.depth > 1 ? d.data.name.split(/(?=[A-Z][a-z])/g) : [d.data.name];
        // Optionally include the value for leaf nodes
        if (!d.children) {
            parts.push(`\n${format(d.value)}`);
        }
        return parts;
    })
    .join("tspan")
    .attr("x", 3) // A slight offset from the left edge of the rectangle
    .attr("y", (d, i) => `${1.1 + i * 1.2}em`) // Stacking tspans vertically
    .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : 1) // Dim the value a bit
    .text(d => d);

nodes.append("title")
    .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("\\")}\n${format(d.value)}`);

    }
  </script>
  
  <svg id="treemap"></svg>
  
  <style>
    #treemap {
      display: block;
      margin: 50px;
      max-width: 50%;
      height: auto;
      background-color: #f0f0f0; /* Light grey background */
    }
  </style>
  