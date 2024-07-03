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

        // const svg = d3.select("#treemap")
        //     .attr("viewBox", [0, 0, width, height])
        //     .style("font", "10px sans-serif");


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
            


    


            

            function tile(node, x0, y0, x1, y1) {
            d3.treemapBinary(node, 0, 0, width, height);
            for (const child of node.children) {
            child.x0 = x0 + child.x0 / width * (x1 - x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
            }
        }
          // Compute the layout.
            const hierarchy = d3.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);
            const root = d3.treemap().tile(tile)(hierarchy);

            // Create the scales.
            const x = d3.scaleLinear().rangeRound([0, width]);
            const y = d3.scaleLinear().rangeRound([0, height]);

            // Formatting utilities.
            const format = d3.format(",d");
            const name = d => d.ancestors().reverse().map(d => d.data.name).join("/");

            // Create the SVG container.
            const svg = d3.select("#treemap")
                .attr("viewBox", [0.5, -30.5, width, height + 30])
                .attr("width", width)
                .attr("height", height + 30)
                .attr("style", "max-width: 100%; height: auto;")
                .style("font", "10px sans-serif");


          

            let idCounter = 0;
            function uid(name) {
                return new String(`O-${name}-${++idCounter}`).replace(/\s+/g, '-');
            }


            let group = svg.append("g")
                .call(render, root);


                function render(group, root) {
        const node = group
            .selectAll("g")
            .data(root.descendants())
            .join("g");

        node.filter(d => d.depth < 2)
            .attr("cursor", "pointer")
            .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d));

        node.append("title")
            .text(d => `${name(d)}\n${format(d.value)}`);

        node.append("rect")
            .attr("id", d => (d.leafUid = uid("leaf")))
            .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
            .attr("stroke", "#fff");

        node.append("clipPath")
            .attr("id", d => (d.clipUid = uid("clip")))
            .append("use")
            .attr("xlink:href", d => `#${d.leafUid}`);

        node.append("text")
            .attr("clip-path", d => `url(#${d.clipUid})`)
            .attr("font-weight", d => d === root ? "bold" : null)
            .selectAll("tspan")
            .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
            .join("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
            .text(d => d);

        group.call(position, root);
    }

    function position(group, root) {
        group.selectAll("g")
            .attr("transform", d => {
                if (d === root) return `translate(0,-30)`;
                const xScale = d3.scaleLinear().domain([d.parent.x0, d.parent.x1]).range([0, x(d.parent.x1) - x(d.parent.x0)]);
                const yScale = d3.scaleLinear().domain([d.parent.y0, d.parent.y1]).range([0, y(d.parent.y1) - y(d.parent.y0)]);
                return `translate(${x(d.parent.x0) + xScale(d.x0)},${y(d.parent.y0) + yScale(d.y0)})`;
            })
            .select("rect")
            .attr("width", d => {
                if (d === root) return width;
                const xScale = d3.scaleLinear().domain([d.parent.x0, d.parent.x1]).range([0, x(d.parent.x1) - x(d.parent.x0)]);
                return xScale(d.x1) - xScale(d.x0);
            })
            .attr("height", d => {
                if (d === root) return 30;
                const yScale = d3.scaleLinear().domain([d.parent.y0, d.parent.y1]).range([0, y(d.parent.y1) - y(d.parent.y0)]);
                return yScale(d.y1) - yScale(d.y0);
            });
    }

  // When zooming in, draw the new nodes on top, and fade them in.
    function zoomin(d) {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.append("g").call(render, d);

        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);

        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
            .call(position, d.parent))
            .call(t => group1.transition(t)
            .attrTween("opacity", () => d3.interpolate(0, 1))
            .call(position, d));
    }

  // When zooming out, draw the old nodes on top, and fade them out.
    function zoomout(d) {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.insert("g", "*").call(render, d.parent);

        x.domain([d.parent.x0, d.parent.x1]);
        y.domain([d.parent.y0, d.parent.y1]);

        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
            .attrTween("opacity", () => d3.interpolate(1, 0))
            .call(position, d))
            .call(t => group1.transition(t)
            .call(position, d.parent));
    }
            
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
  