<script lang="ts">
    import { onMount } from 'svelte';
    import type { Node, Issue } from "../../types/collection";
    import { selectedNodeStore, nodesDataStore, issuesDataStore, currentSelectedIssue } from "../../stores";
    import { get } from "svelte/store";
    import * as d3 from 'd3';
  
    let searchTerm = '';

        type HierarchyData = {
        id?: number; // Consistent type with Node.id and Issue.id
        name: string;
        children: Array<HierarchyData | Issue>; // Assuming issues can be directly under the root or nodes
    };

    $: searchTerm, updateIssuesAndNodes();



function searchAndRebuildHierarchy(hierarchy: HierarchyData, nodes: Node[], issues: Issue[], searchTerm: string): HierarchyData | null {

    function buildPathToRoot(nodeId: number, path: HierarchyData[] = []): HierarchyData[] {
    
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return path;
        const newNode: HierarchyData = { id: node.id, name: node.name, children: [] };
        path.unshift(newNode);
        if (node.parent_id !== null) {
            return buildPathToRoot(node.parent_id, path);
        }
        return path;
    }

    // Enhanced to search through all issues
    
    console.log(issues);
    const issueMatch = issues.find(issue => issue.name.includes(searchTerm));
    console.log(issueMatch);
    if (issueMatch) {
        
        
        let path = buildPathToRoot(issueMatch.node_id);
        
        console.log(path);
        
        // Append the found issue at the end of its parent node with 'value' property
        const issueNode: Issue = { ...issueMatch, value: 5, children: [] };
        if (path.length > 0) {

            const issueNode: Issue = { ...issueMatch, value: 5, children: [] }; // Assuming issueMatch is defined
            path[path.length - 1].children = [issueNode];

            // Reconstruct the hierarchy by nesting nodes correctly
            for (let i = path.length - 2; i >= 0; i--) {
                path[i].children = [path[i + 1]];
            }

            // Now, path[0] contains the full hierarchy from the root to the issue
            return path[0];
        }
    }

    const nodeMatch = nodes.find(node => node.name.includes(searchTerm));
    if (nodeMatch) {
        // Build the path from the matching node to the root, including all its ancestors
        let path = buildPathToRoot(nodeMatch.id);
        
        if (path.length > 1) { // Means the node is not the root itself
            // Rebuild the hierarchy from the path
            for (let i = path.length - 2; i >= 0; i--) {
                path[i].children = [path[i + 1]];
            }
            // Add children to the matching node
            function addChildren(node: HierarchyData) {
                nodes.filter(n => n.parent_id === node.id).forEach(childNode => {
                    const childHierarchyNode: HierarchyData = { id: childNode.id, name: childNode.name, children: [] };
                    node.children.push(childHierarchyNode);
                    addChildren(childHierarchyNode);
                });
                issues.filter(issue => issue.node_id === node.id).forEach(issue => {
                    const transformedIssue: Issue = { ...issue, value: 5, children: [] };
                    node.children.push(transformedIssue);
                });
            }
            // Append descendants to the matching node which is now correctly placed in its hierarchical path
            addChildren(path[path.length - 1]);
        } else if (path.length === 1) {
            // If the matching node has no parent, it means it's the root or a top-level node, handle accordingly
            console.log("1");
            
        }
        
        return path[0]; // Return the complete hierarchy from the root to the matched node, including all ancestors
    }

    return null; // No match found
}
// Example usage:


function buildHierarchy(nodes: Node[], issues: Issue[]) {
    const nodeMap = new Map(nodes.map(node => [node.id, {
        id: node.id,
        name: node.name,
        parent_id: node.parent_id,
        children: []
    }]));

    issues.forEach(issue => {
        const issueTransformed = {
            id: issue.id,
            node_id: issue.node_id,
            name: issue.name,
            value: 5,
            children: []
        };
        if (nodeMap.has(issue.node_id)) {
            nodeMap.get(issue.node_id).children.push(issueTransformed);
        }
    });

    const setChildren = (parentNode) => {
        parentNode.children = parentNode.children.map(child => {
            if (nodeMap.has(child.id)) {
                return setChildren(nodeMap.get(child.id));
            } else {
                return child;
            }
        });
        return parentNode;
    };

    nodes.forEach(node => {
        if (node.parent_id !== null && nodeMap.has(node.parent_id)) {
            const parent = nodeMap.get(node.parent_id);
            if (!parent.children.some(child => child.id === node.id)) {
                parent.children.push(nodeMap.get(node.id));
            }
        }
    });

    let roots = [];
    nodeMap.forEach((node) => {
        if (node.parent_id === null) {
            roots.push(setChildren(node));
        }
    });

    // Determine if there's one root or multiple and prepare for logging
    const hierarchy = roots.length === 1 ? roots[0] : roots;

    // Log the hierarchy as a formatted JSON string for easy reading
    console.log(JSON.stringify(hierarchy, null, 2));

    return hierarchy;
}

    let issues: Issue[] = []
    let nodes: Node[] = []

    
    $: if ($issuesDataStore) {
        updateIssuesAndNodes();
    }


    async function updateIssuesAndNodes() {
    try {
        const issues = get(issuesDataStore);
        const nodes = get(nodesDataStore);
        let data = buildHierarchy(nodes, issues);

        const result = searchAndRebuildHierarchy(data, nodes, issues, searchTerm);
        if (searchTerm != "" ) {
            if (result) {
                console.log("Search result:", result);
                drawTreeMap(result);
            }
        } else {
            drawTreeMap(data);
        }
        

        
    } catch (error) {
        console.error("Failed to update issues and nodes:", error);
    }
}


    onMount(() => {
    updateIssuesAndNodes();
  });


  
  function drawTreeMap(data) {
        const width = 600; // Adjusted from 800
        const height = 600; // Adjusted from 600

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

    svg.selectAll("*").remove();
    const nodes = svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    // Draw rectangles
    nodes.append("rect")
        .attr("fill", d => color(d.depth))
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
                .on("click", (event, d) => {
            // Here, `d` is the data bound to the clicked rectangle
            if (d.data.value !== undefined) { // Assuming issues have a 'value' property
                currentSelectedIssue.set(d.data);
                console.log("Issue selected:", d.data);
            } else {
                selectedNodeStore.set(d.data);
                console.log("Node selected:", d.data);
            }
        });

// Adding text for all nodes
nodes.append("text")
    .selectAll("tspan")
    .data(d => {
        // Check if the node is an issue by looking for a 'value' property within d.data
        const isIssue = d.data.value !== undefined;

        // Check if the node has children
        const hasChildren = d.children;

        // If the node has children or is an issue, prepare the text parts
        if (hasChildren || isIssue) {
            // Use the full name for parent nodes or split the name for issues/leaf nodes
            const parts = hasChildren ? [d.data.name] : d.data.name.split(/(?=[A-Z][a-z])/g);

            // For issues, optionally append the value
            if (isIssue) {
                parts.push(`\n${d.data.value}`); // Assuming you have a 'format' function for the value
            }
            return parts;
        } else {
            // For nodes without children and not issues, don't display any text
            return [];
        }
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
<input type="text" placeholder="Search nodes or issues..." bind:value={searchTerm} />


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
  