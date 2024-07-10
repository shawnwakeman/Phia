<script lang="ts">
    import { onMount } from 'svelte';
    import type { Node, Issue } from "../../types/collection";
    import { selectedNodeStore, nodesDataStore, issuesDataStore, currentSelectedIssue, selectedIssues,filteredIssuesDataStore, filterStoreTM, openContextMenuId } from "../../stores";
    import { get } from "svelte/store";
    import * as d3 from 'd3';
    import IssueItem from './List/IssueItem.svelte';
    import * as Drawer from "$lib/components/ui/drawer";
    import { writable } from 'svelte/store';
    import Options from './TreemapDisplayOptions.svelte'
    import IssueView from './issueView/IssueView.svelte';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import ContextMenuItem from '$lib/components/ui/context-menu/context-menu-item.svelte';
    let drawerOpen = writable(false);
    import * as Sheet from "$lib/components/ui/sheet";


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


let data: HierarchyNode

function updateNodeValues(node: HierarchyNode, depth: number = 0): void {
  if (node.value !== undefined) {
    node.value -= depth * 0.5;
  }
  for (const child of node.children) {
    updateNodeValues(child, depth + 1);
  }
}

function getNodeWithParents(node: HierarchyNode): HierarchyNode {
    const path: HierarchyNode[] = [];
    let currentNode = node;

    // Traverse up to the root node, collecting nodes in the path
    while (currentNode) {
        path.push(currentNode);
        currentNode = findParentNode(currentNode);
    }

    // Fetch the real node from the data hierarchy to ensure full children are included
    const realNode = findNodeInData(node.id);
    if (!realNode) {
        throw new Error(`Node with id ${node.id} not found in data`);
    }

    // Rebuild the hierarchy from the root and include the real node
    return buildHierarchyFromPath(path.reverse(), realNode);
}

function findParentNode(node: HierarchyNode): HierarchyNode | null {
    // Recursive function to find the parent node in the hierarchy
    function searchNode(currentNode: HierarchyNode): HierarchyNode | null {
        if (currentNode.children.some(child => child.id === node.id)) {
            return currentNode;
        }
        for (const child of currentNode.children) {
            const result = searchNode(child);
            if (result) {
                return result;
            }
        }
        return null;
    }
    return searchNode(data);
}

function findNodeInData(nodeId: number): HierarchyNode | null {
    // Recursive function to find a node by id in the data hierarchy
    function searchNode(currentNode: HierarchyNode): HierarchyNode | null {
        if (currentNode.id === nodeId) {
            return currentNode;
        }
        for (const child of currentNode.children) {
            const result = searchNode(child);
            if (result) {
                return result;
            }
        }
        return null;
    }
    return searchNode(data);
}

function buildHierarchyFromPath(path: HierarchyNode[], clickedNode: HierarchyNode): HierarchyNode {
    let root = { ...path[0], children: [] };
    let currentNode = root;

    for (let i = 1; i < path.length; i++) {
        const realNode = findNodeInData(path[i].id);
        const newNode = realNode ? { ...realNode, children: [] } : { ...path[i], children: [] };
        currentNode.children = [newNode];
        currentNode = newNode;
    }

    // Add the clicked node's data, including its children, to the final node in the path
    currentNode.children = clickedNode.children.map(child => ({ ...child }));

    return root;
}



const gatherAllIssues = (node) => {
    let issues = [];
    if (node.data.value !== undefined) {
        issues.push(node.data);
    }
    if (node.children) {
        node.children.forEach(child => {
            issues = issues.concat(gatherAllIssues(child));
        });
    }
    return issues;
};

    let filters = {
        rowByField: 'state',
        orderByField: 'id',
        orderDirection: 'asc',
        hideEmptyRows: false,
        hideNullRows: false,
    };

    const unsubscribe = filterStoreTM.subscribe(value => {
        filters = value;
        // Call the required code whenever the filters are updated
        console.log('Filters updated:', filters);
        // Your code to handle filter changes
    });
    
   
    const showContextMenu = writable(false);


    onMount(() => {



        let width = 0;
        let height = 0;

 
       


        function updateDimensions() {
            const parentDiv = document.getElementById('data');
            const layoutDiv = document.getElementById('layout-id');
            const sidebarDiv = document.getElementById('sidebar-div');
            const svgElement = document.getElementById('treemap');
            if (layoutDiv && parentDiv && sidebarDiv && svgElement) {

                const layoutHeight = parseFloat(window.getComputedStyle(layoutDiv).height);
                const sidebarWidth = parseFloat(window.getComputedStyle(sidebarDiv).width);

                
                parentDiv.style.height = `${window.innerHeight - layoutHeight}px`;
                parentDiv.style.width = `${window.innerWidth - sidebarWidth}px`;

                width = window.innerWidth - sidebarWidth - 25;
                height = window.innerHeight - layoutHeight - 18;

                const dataDiv = document.getElementById('data');
            
                
                // Get the dimensions of the data div
                const widthSvg = dataDiv.clientWidth - 15;
                const heightSvg = dataDiv.clientHeight - 15;
                
                // Set the dimensions of the SVG element
                svgElement.setAttribute('width', widthSvg);
                svgElement.setAttribute('height', heightSvg);


           
                


                updateViewBox(width, height);

                d3.select("#treemap")
                    .attr("width", width)
                    .attr("height", height);

                drawTreeMap(data);
            }
               
           
        }

        const svg = d3.select("#treemap")
            .attr("viewBox", [0, 0, width, height])
            .style("font", "10px sans-serif")

        function updateViewBox(newWidth: number, newHeight: number) {
            d3.select("#treemap")
                .attr("viewBox", `0 0 ${newWidth} ${newHeight}`);

   
        }



        let hydrated = false;

        selectedIssues.subscribe((value) => {
            if (hydrated) {
                data = buildHierarchy($nodesDataStore, $filteredIssuesDataStore);
                drawTreeMap(data)
            }
           
            

        });
        nodesDataStore.subscribe((value) => {
            if (hydrated) {
                data = buildHierarchy(value, $filteredIssuesDataStore);
                drawTreeMap(data)
            }
           
            

        });

        filteredIssuesDataStore.subscribe((value) => {
            
            
            if (hydrated) {
                data = buildHierarchy($nodesDataStore, value);
                drawTreeMap(data)
            } else {
                data = buildHierarchy($nodesDataStore, $issuesDataStore);
            }
            hydrated = true
        
           
        });


        
        window.addEventListener('resize', () => {
            if(data) {
                updateDimensions();
         
            }
          
             
            
        });
    
        let isZoomed = false;
        let currentZoomNode = null;

        function drawTreeMap(data) {
            
     
            const isIssueSelected = (issue) => {
                const issues = get(selectedIssues);
                return issues.some(selectedIssue => selectedIssue.id === issue.id);
            };
            const format = d3.format(",d");
            const color = d3.scaleLinear([0, 10] , ["#b8c2ce", "#0f1626"]);
            const textColorContainer = d3.scaleLinear([0, 10] , ["black", "white"]);
            const color2 = d3.scaleOrdinal(["Open", "DOING", "DONE"], ["#7caddd", "#214e99", "#57c09c"]);


            const treemap = data => d3.treemap()
            .size([width, height])
  
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

        

            svg.selectAll("g").remove();

            const nodes = svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

            

    
            
            // Draw rectangles


            nodes.append("rect")
            .attr("fill", d => d.data.value !== undefined ? color2(d.data.state) : color(d.depth))
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("stroke", d => {
                if (isIssueSelected(d.data)) {
                    return "red"
                }
                
                const fillColor = d3.rgb(d.data.value !== undefined ? color2(d.data.state) : color(d.depth));
                return fillColor.darker(1.2);
            })
            .attr("stroke-width", d => {
                if (isIssueSelected(d.data)) {
                    return "2px"
                }
                return "1px"

            })


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
                .on("click", (event, d) => handleClick(event, d))
                .on("contextmenu", (event, d) => handleRightClick(event, d)); 
                function handleClick(event, d) {
                    if (event.ctrlKey) {
                        // Control key is pressed
                        if (d.data.value !== undefined) {
                            // Single issue click
                            const issues = get(selectedIssues);
                            if (!isIssueSelected(d.data)) {
                                selectedIssues.update(n => [...n, d.data]); // Add issue to selected list
                                console.log("Issue added to selected list:", d.data);
                            } else {
                                selectedIssues.update(n => n.filter(issue => issue.id !== d.data.id)); // Remove issue from selected list
                                console.log("Issue removed from selected list:", d.data);
                            }
                        } else {
                            // Node click
                            const allIssues = gatherAllIssues(d);
                            const issues = get(selectedIssues);
                            const allSelected = allIssues.every(issue => isIssueSelected(issue));

                            if (allSelected) {
                                // Deselect all issues under the node
                                selectedIssues.update(n => n.filter(issue => !allIssues.includes(issue)));
                                console.log("All issues under node deselected:", allIssues);
                            } else {
                                // Select all issues under the node
                                const newSelectedIssues = [...issues, ...allIssues.filter(issue => !isIssueSelected(issue))];
                                selectedIssues.set(newSelectedIssues);
                                console.log("All issues under node selected:", allIssues);
            }
                        }
                 
                    } else if (d.data.value !== undefined) {
                        // Issue selected without Control key
                        currentSelectedIssue.set(d.data);
                        console.log("Issue selected:", d.data);
                        drawerOpen.set(true);
                    } else {
                        // Node selected without Control key
                        selectedNodeStore.set(d.data);
                        console.log("Node selected:", d.data);

                        const nodesWithParents = getNodeWithParents(d.data);
                        console.log(nodesWithParents);

                        drawTreeMap(nodesWithParents);
                    }
                }
            function handleRightClick(event, d) {
            event.preventDefault(); // Prevent the default context menu
            if (d.data.value !== undefined) {
                // Handle right-click on an issue
                console.log("Right-clicked on issue:", d.data);

                showContextMenu.set(true);


                // Add your custom right-click logic here
            } else {
                // Handle right-click on a node\
                showContextMenu.set(false);
                console.log("Right-clicked on node:", d.data);
                // Add your custom right-click logic here
            }
        }

        // Update styles for selected issues
        function updateStyles() {
            nodes.selectAll("rect").each(function (d) {
                if (d.data.value !== undefined) {
                    d3.select(this).classed("selected-rect", isIssueSelected(d.data));
                }
            });
        }


    }

    updateDimensions()

   
       

    

    return () => {
        unsubscribe();
    }





  });


    

  </script>
  
<ContextMenu.Root>
    <ContextMenu.Trigger>
        
     
            <div class="data" id="data">
        
               
            
                    <svg id="treemap"></svg>
                    
        
             </div>

    </ContextMenu.Trigger>
    {#if $showContextMenu}
    <ContextMenu.Content>
        <ContextMenu.Item>Profile</ContextMenu.Item>
        <ContextMenu.Item>Billing</ContextMenu.Item>
        <ContextMenu.Item>Team</ContextMenu.Item>
        <ContextMenu.Item>Subscription</ContextMenu.Item>
      </ContextMenu.Content>
    {/if}

    </ContextMenu.Root>




<Sheet.Root bind:open={$drawerOpen}>   
    <IssueView {drawerOpen} issue={$issuesDataStore.find(issue => issue.id === $currentSelectedIssue?.id)}/>
  </Sheet.Root>
  
<style>



    #treemap {
        margin: 0;
    }



    .treemap-container {

        overflow: hidden;
  }



  :global(.selected-rect) {
    stroke: red;
    stroke-width: 2px;
    }

    .data {
  
        overflow: hidden;

        padding-top: 5px;
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 15px;
      
    }
  

</style>
  