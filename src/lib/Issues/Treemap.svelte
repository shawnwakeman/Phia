<script lang="ts">
    import { onMount } from 'svelte';
    import type { Node, Issue } from "../../types/collection";
    import { selectedNodeStore, nodesDataStore, issuesDataStore, currentSelectedIssue } from "../../stores";
    import { get } from "svelte/store";
    import * as d3 from 'd3';
    import IssueItem from './List/IssueItem.svelte';
  



// Example usage:
type HierarchyNode = {
  id: number;
  name: string;
  parent_id: number | null;
  children: HierarchyNode[];
  value?: number;
  state?: string;
};

function buildHierarchy(nodes: Node[], issues: Issue[]) {

    const nodeMap = new Map<number, Node>();
    const hierarchyMap = new Map<number, HierarchyNode>();

    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });

    function createHierarchyNode(node: Node): HierarchyNode {
        return {
        id: node.id,
        name: node.name,
        parent_id: node.parent_id,
        children: []
        };
    }

    function addNodePath(issue: Issue) {
            let currentNodeId = issue.node_id;
            let childHierarchyNode: HierarchyNode | null = {
            id: issue.id,
            name: issue.name,
            parent_id: currentNodeId,
            children: [],
            value: 10,
            state: issue.state
        };

        while (currentNodeId !== null) {
        const currentNode = nodeMap.get(currentNodeId);
        if (!currentNode) break;

        if (hierarchyMap.has(currentNodeId)) {
            const existingNode = hierarchyMap.get(currentNodeId)!;
            if (childHierarchyNode) {
            existingNode.children.push(childHierarchyNode);
            }
            break;
        }

        const newHierarchyNode = createHierarchyNode(currentNode);
        if (childHierarchyNode) {
            newHierarchyNode.children.push(childHierarchyNode);
        }

        hierarchyMap.set(currentNodeId, newHierarchyNode);
        childHierarchyNode = newHierarchyNode;
        currentNodeId = currentNode.parent_id;
        }
    }

    issues.forEach(issue => {
    console.log(issue.description); // Log the issue description
    if (nodeMap.has(issue.node_id)) {
      addNodePath(issue);
    } else {
      console.warn(`Issue ${issue.description} has a node_id ${issue.node_id} that does not exist in nodes.`);
    }
  });

    // Find the root node (the one with no parent)
    const rootNode = nodes.find(node => node.parent_id === null);
    if (!rootNode) {
        throw new Error("No root node found");
    }
    console.log(JSON.stringify(hierarchyMap.get(rootNode.id)!, null, 2));

    updateNodeValues(hierarchyMap.get(rootNode.id)!);
    return hierarchyMap.get(rootNode.id)!;



}

function updateNodeValues(node: HierarchyNode, depth: number = 0): void {
  if (node.value !== undefined) {
    node.value -= depth * 0.5;
  }
  for (const child of node.children) {
    updateNodeValues(child, depth + 1);
  }
}



    




    let data: HierarchyNode
    onMount(() => {
        const parentDiv = document.getElementById('treemap');
        const parentRect = parentDiv.getBoundingClientRect()
        let width = parentRect.width;
        let height = parentRect.height
        function updateDimensions() {
            const parentDiv = document.getElementById('treemap');
            const parentRect = parentDiv.getBoundingClientRect();
            const parentWidth = parentRect.width;
            const parentHeight = parentRect.height
                console.log(parentWidth, parentHeight);
                width = parentWidth;
                height = parentHeight;
                updateViewBox(parentWidth, parentHeight);
                drawTreeMap(data)
        }

        const svg = d3.select("#treemap")
            .attr("viewBox", [0, 0, width, height])
            .style("font", "10px sans-serif");


        function updateViewBox(newWidth: number, newHeight: number) {
            d3.select("#treemap")
                .attr("viewBox", `0 0 ${newWidth} ${newHeight}`);


   
        }



        nodesDataStore.subscribe((value) => {
            data = buildHierarchy(value, $issuesDataStore);
        
            drawTreeMap(data)
        });

        issuesDataStore.subscribe((value) => {
            data = buildHierarchy($nodesDataStore, value);
        
            drawTreeMap(data)
        });

        window.addEventListener('resize', () => {
            if(data) {
                updateDimensions();
            }
          
             
            
        });



        function drawTreeMap(data) {
            


            const format = d3.format(",d");
            const color = d3.scaleLinear([0, 10] , ["#b8c2ce", "#0f1626"]);
            const textColorContainer = d3.scaleLinear([0, 10] , ["black", "white"]);
            const color2 = d3.scaleOrdinal(["open", "doing", "done"], ["#7caddd", "#214e99", "#57c09c"]);

            function tile(node, x0, y0, x1, y1) {
            d3.treemapBinary(node, 0, 0, width, height);
            for (const child of node.children) {
            child.x0 = x0 + child.x0 / width * (x1 - x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
            }
        }
            const treemap = data => d3.treemap()
            .size([width, height])
            .tile(tile)
            .paddingOuter(5)
            .paddingTop(19)
            .paddingInner(5)
            .round(true)
            (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

            const root = treemap(data);

            const x = d3.scaleLinear().rangeRound([0, width]);
            const y = d3.scaleLinear().rangeRound([0, height]);

        

            svg.selectAll("*").remove();
            
            const nodes = svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
            
            // Draw rectangles

            function render(nodes, root) {
                
            }
            nodes.append("rect")
                .attr("fill", d => d.data.value !== undefined ? color2(d.data.state) : color(d.depth)) // Set fill to none if the node has a value
               
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("rx", 5) // Set the x-axis radius of the corners
                .attr("ry", 5) // Set the y-axis radius of the corners
                .attr("stroke", d => {
                    const fillColor = d3.rgb(d.data.value !== undefined ? color2(d.depth) : color(d.depth));
                    return fillColor.darker(1.2); // Slightly darker for contrast
                })
                .attr("stroke-width", 1); // Set stroke width to thin
            // Add names
            nodes.append("foreignObject")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .append("xhtml:div")
            .style("overflow", "hidden")
            .style("height", "100%")
            .style("width", "100%")
            .style("white-space", "pre-wrap")
            .style("word-wrap", "break-word")
            .style("text-align", "left")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "flex-start")
            .style("justify-content", "flex-start")
            .style("padding", "2px")
            .style("padding-top", "3px") // Adjust top padding value as needed
            .style("padding-left", "4px") // Adjust left padding value as needed
            .style("font-size", "10px")
            .style("color", "#000")
            .html(d => {
                if (d.data.value !== undefined) {
                return `<div>${d.data.name}</div><div>Value: ${d.data.value}</div>`;
                } else {
                return `<div>${d.data.name}</div>`;
                }
            })
            .on("click", (event, d) => {
                if (d.data.value !== undefined) { // Assuming issues have a 'value' property
                currentSelectedIssue.set(d.data);
                console.log("Issue selected:", d.data);
                } else {
                selectedNodeStore.set(d.data);
                console.log("Node selected:", d.data);
                }
            });
        }
        
    
  });


  

  </script>

<div class="treemap-container">
    <svg id="treemap"></svg>
</div>
  
<style>
  #treemap {
    width: 100%;
    height: 100%;

  }

  .treemap-container {
    flex: 1; /* Take up remaining space */
    padding: 20px;
  }





</style>
  