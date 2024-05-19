<script lang="ts">
    


    import { onMount } from 'svelte';
    import type { Node, Issue } from "../types/collection"
    import * as d3 from 'd3';
    import { selectedNodeStore } from "../stores";
    import { selectedNodeId, nodesDataStore, navigateNodeStore, issuesDataStore, sidebarWidthStore } from "../stores";
    import { get } from 'svelte/store';
    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    import { canJoin } from '@tiptap/pm/transform';
    const primcolor = "red"
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

        
    
    let currentZoomScale = 1; // Global variable to track zoom scale
    let currentSelectedNodeId: number;
        selectedNodeId.subscribe(value => {
            currentSelectedNodeId = value;
            
        });


        
    let nodes;    

    function getNestedIssuesTotalPriority(nodeId: number, nodes: Node[], issues: Issue[]): number {


    function findChildNodeIds(nodeId: number, nodes: Node[]): number[] {
        const childNodes = nodes.filter(node => node.parent_id === nodeId);
        let childNodeIds = childNodes.map(node => node.id);
        for (let childNode of childNodes) {
            childNodeIds = childNodeIds.concat(findChildNodeIds(childNode.id, nodes));
        }
        return childNodeIds;
    }

    const nestedNodeIds = [nodeId, ...findChildNodeIds(nodeId, nodes)];
    const totalPriority = issues.reduce((acc, issue) => {
        if (issue.node_id !== null && nestedNodeIds.includes(issue.node_id)) {
            const priorityValue = {
                'Low': 1,
                'Medium': 4,
                'High': 9,
                'Critical': 16
            };
            return acc + (priorityValue[issue.priority] || 0);
        }
        return acc;
    }, 0);

  
    return totalPriority;
}

    
function createHierarchy(data: Node[]): WritableNode | null {
    // Mapping object to store nodes by id for quick reference, and to track the parent-child relationships
    const elements: { [key: number]: WritableNode } = {};
        

    
    // Temporary variable to hold identified root node(s)
    let rootCandidates: WritableNode[] = [];
    
    data.forEach((d) => {
        const element: WritableNode = { id : d.id, name: d.name, value: d.value, children: [], fillColor: "red", state: d.state };
        elements[d.id] = element;
      
        
        if(d.parent_id === null) {
            rootCandidates.push(element); // Potential root node based on missing parent_id
        }
    });
  
    if (rootCandidates.length === 0) {
        console.error("No root node found in the data.");
        return null; // Return null if no root node is found
    } else if (rootCandidates.length > 1) {
        console.warn("Multiple root nodes found. Using the first one found as the root.");
    }
  
    data.forEach((d) => {
        if (d.parent_id !== null && elements[d.parent_id]) {
            elements[d.parent_id].children!.push(elements[d.id]);
        }
    });
    // Recalculate child values after hierarchy is built
    Object.values(elements).forEach((element) => {
    if (element.children && element.children.length > 0) {
        const totalChildValue = element.children.reduce((acc, child) => acc + child.value, 0);

        // Determine if all children have the same value
        const firstChildValue = element.children[0].value;
        let allChildrenSame = element.children.every(child => child.value === firstChildValue);
        const moreThanTenChildren = element.children.length > 10;
        element.children.forEach((child) => {
            if (totalChildValue > 1) {
                // Apply existing conditions
                if (element.children.length === 3) {
                    child.value = ((child.value / totalChildValue) / 1.9) * 1.2 * element.value;
                } else if (element.children.length === 2) {
                    child.value = ((child.value / totalChildValue) / 1.9) * 1 * element.value;
                } else {
                    child.value = ((child.value / totalChildValue) / 1.9) * 1 * element.value;
                }

                // New conditions based on children's values uniformity
                if (allChildrenSame) {
                    child.value *= .95; // Slight scale down if all children have the same value
                } else if (!allChildrenSame && element.children.length === 3) {
                    child.value *= .95;
                }
                else {
                    child.value *= 1.15; // Scale up more significantly if values are different
                }

                if (moreThanTenChildren) {
                    child.value *= 0.95; // Additional 10% scale down
                }
            } else {
                // If totalChildValue is zero, distribute parent's value equally
                child.value = element.value;
            }

            child.value *= 0.9; // Apply final scaling factor
   
        });
    }
});




return rootCandidates[0];
}
    



    let data: WritableNode | null;


    let currentZoomLevel = 1;

    let isFirstLoad = true; 
    let isFirstLoad2 = true; 

    let width: number = 100;
    let height: number = 100;
    let lastWidth = [0];
    
    onMount(async () => {
        let browserWidth, browserHeight;
        function updateDimensions(value) {
            if (value[0] > 15) {
            

// Get current browser dimensions
            browserWidth = window.innerWidth;
            browserHeight = window.innerHeight;

            let parentWidth = (value[0] / 100) * browserWidth;

            let parentHeight = browserHeight * 1.1;

            let aspectRatio = parentWidth / parentHeight;

            let innerWidth = aspectRatio * parentHeight;
            let innerHeight = parentHeight;
            
            innerWidth = Math.max(100, Math.min(500, innerWidth));
            innerHeight = innerWidth / aspectRatio;

            // Ensure inner dimensions also adhere to the minimum and maximum limits
            innerHeight = Math.max(100, Math.min(500, innerHeight));
            if (innerHeight === 500 || innerHeight === 100) {
                innerWidth = innerHeight * aspectRatio;
            }
            

  
             

                if (!isFirstLoad) {
                    console.log("ads");
                    
                        width = innerWidth;
                        height = innerHeight
                        updateViewBox(innerWidth, innerHeight);
                        updateVisuals();
                 
                    
                    
                    
                    

                }

            }
        }
        sidebarWidthStore.subscribe((value) => {
            updateDimensions(value)
        
        });
        window.addEventListener('resize', () => {
            sidebarWidthStore.update(value => {
                updateDimensions(value);
                return value;
            });
        });


     
   
        nodesDataStore.subscribe((value) => {

      
            
            data = createHierarchy(value)
            if (!isFirstLoad) {
  
                
                
                updateVisuals();
                if (selectedNode) {
                    centerOnNode(selectedNode);
                }
            
               
                
            }
            isFirstLoad = false; // Update flag after first run
        }); // logs 'got a subscriber', then '1'

        navigateNodeStore.subscribe(value => {
            if (value) {

                if (nodes && !isFirstLoad) {

                    
                    let currentNode = nodes.find(d => d.data.id === value.id);
            
                    handleCircleClick(currentNode)
                }
            }
        });

            ////////////////////////////////////////////////////////////// 
			////////////////// Create Set-up variables  ////////////////// 
			////////////////////////////////////////////////////////////// 





// Assuming the payload structure is known and matches the Node interface
// Adjust the types as necessary to match your actual data structure
    
function centerOnNode(node) {
    const maxWidthRatio = 0.7; // Circle should cover up to 80% of the width
    const maxHeightRatio = 0.7; // Circle should cover up to 80% of the height

    // Calculate potential scales for both width and height to keep the circle within view
    const scaleWidth = (width * maxWidthRatio) / (node.r * 2); // Scale based on width
    const scaleHeight = (height * maxHeightRatio) / (node.r * 2); // Scale based on height

    // Use the smaller scale to ensure the circle fits in both dimensions without clipping
    const k = Math.min(scaleWidth, scaleHeight);

    const x = width / 2 - k * node.x;
    const y = height / 2 - k * node.y;

    const transform = d3.zoomIdentity.translate(x, y).scale(k);
    svg.call(zoom.transform, transform); // Apply the transformation without transition
}

function centerOnNodeALL(node) {
    // Constants to control the maximum visible size of the circle
    const maxWidthRatio = 0.7; // Circle should cover up to 80% of the width
    const maxHeightRatio = 0.7; // Circle should cover up to 80% of the height

    // Calculate potential scales for both width and height to keep the circle within view
    const scaleWidth = (width * maxWidthRatio) / (node.r * 2); // Scale based on width
    const scaleHeight = (height * maxHeightRatio) / (node.r * 2); // Scale based on height

    // Use the smaller scale to ensure the circle fits in both dimensions without clipping
    const k = Math.min(scaleWidth, scaleHeight);

    const x = width / 2 - k * node.x;
    const y = height / 2 - k * node.y - 15;

    const transform = d3.zoomIdentity.translate(x, y).scale(k);
    svg.transition()
       .duration(750)
       .ease(d3.easeCubicInOut)
       .call(zoom.transform, transform);
}




  
    let okay = false;

    // Create SVG element
    const zoom = d3.zoom<SVGSVGElement, unknown>()

    .on("zoom", (event) => {
        g.attr("transform", event.transform);
        currentZoomLevel = event.transform.k;
  
        

        // Use debounced function to handle updates

    });

    function getTextTransform(d, currentZoomScale) {
        const scale = 1 / (d.depth * currentZoomScale);  // Adjust depth scaling based on current zoom
        return `translate(${d.x},${d.y}) scale(${scale})`;
    }


    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

    const debouncedUpdateVisuals = debounce(() => {
        updateVisuals();
    });





    function updateViewBox(newWidth: number, newHeight: number) {
    d3.select("#circle-packing svg")
        .attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    }
    
    const svg = d3.select("#circle-packing")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "sans-serif");
 
    svg.append("defs")
    // Initialize zoom behavior

    svg.call(zoom as any);


    const g = svg.append("g");



    // Set the default zoom level to 80% and center it

    
    if (data === null) {
        console.error("Failed to create hierarchical data.");
        return; // or return some fallback value if needed
    }




 
    // Prepare the data for visualization



    let selectedNode: d3.HierarchyCircularNode<WritableNode> | null = nodes;


    let currentDepth = 0;


    // Stack to keep track of zoom levels


    function updateVisuals() {
        console.log("update");
        
    if (!data) {
        console.error("Failed to create hierarchical data.");
        return;
    }

    const rootPadding = 20; // Extra padding for the root node
    const childNodePadding = 5; // Extra padding for nodes with children


const root = d3.hierarchy<WritableNode>(data)
    .sum(d => d.value ?? 0) // Only use the node's own value
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)); // Keep sorting if needed

const scaleFactor = 1;
const pack = d3.pack<WritableNode>()
    .size([width * scaleFactor, height * scaleFactor])
    .padding(d => {
        // Keep your dynamic padding logic
        if (d.depth === 0) {
            return .7; // Adjust padding for non-root nodes with children
        } else if (d.depth === 1) {
            return .3; // Consistent padding for root's direct children
        } else {
      
            
            return d.r * 1 
        }
        
    });

nodes = pack(root);
console.log(nodes);

selectedNode = nodes.find(n => n.data.id === $selectedNodeId);
// Apply the pack layout to your hierarchy








    updateCircles(nodes);
    updateText(nodes);
    centerOnNodeALL(selectedNode)
}

function getColorByStatus(status) {
    switch (status) {
        case "Open":
            return "#6FB1FC";
        case "Planned":
            return "#b92b27";
        case "In Progress":
            return "#185A9D";
        case "Completed":
            return "#43CEA2";
        default:
            return "#cccccc";
    }
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    const hex = (x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return "#" + hex(r) + hex(g) + hex(b);
}

// Helper functions for color conversions


// Calculate the average color of an array of children nodes
function getAverageColor(children) {
    
    let totalR = 0, totalG = 0, totalB = 0, totalPriority = 0;
    children.forEach(child => {
        let priority = child.data.value;

        
        let [r, g, b] = hexToRgb(child.data.fillColor); // Assuming each child has a fillColor and totalPriority
        totalR += r * priority;
        totalG += g * priority;
        totalB += b * priority;
        totalPriority += priority;
    });

    if (totalPriority === 0) {
        // Prevent division by zero if totalPriority is unexpectedly zero
        return "#cccccc"; // Return a default neutral color
    }

    const avgR = Math.round(totalR / totalPriority);
    const avgG = Math.round(totalG / totalPriority);
    const avgB = Math.round(totalB / totalPriority);

    return rgbToHex(avgR, avgG, avgB);
}

function updateNodeColors(node) {
    if (!node.children || node.children.length === 0) {
        // Leaf node, set color based on its status
        node.data.fillColor = getColorByStatus(node.data.state);
    } else {
        // Recursively update child nodes first
        node.children.forEach(child => updateNodeColors(child));

        // After all children are updated, calculate and set this node's average color
        node.data.fillColor = getAverageColor(node.children);
    }
    
    // Update the parent node's color, if it exists
    if (node.parent) {
        updateParentColor(node.parent);
    }
}

function updateTreeColors(node) {
    updateNodeColors(node); // Update the current node and all children first

    // After updating this node and its children, if there's a parent, update it
    if (node.parent) {
        updateParentColor(node.parent); // Recursively update parent node
    }
}

function updateParentColor(node) {
    // Calculate average color from child nodes
    node.data.fillColor = getAverageColor(node.children);

    // If this node has a parent, update the parent's color
    if (node.parent) {
        updateParentColor(node.parent);
    }
}

    function updateCircles(nodes: d3.HierarchyCircularNode<WritableNode>) {
        
        
        let maxPriority = d3.max(nodes.descendants(), d => d.data.totalPriority) || 1; // Find maximum totalPriority for normalization

        nodes.descendants().forEach(node => {

            
            node.data.totalPriority = getNestedIssuesTotalPriority(node.data.id, $nodesDataStore, $issuesDataStore);

            // Normalize totalPriority to fit within the gradient range
            let normalizedPriority = (node.data.totalPriority / maxPriority) * 100; // Normalize to percentage

           
            
            if (node.data.totalPriority === 0) {
                node.data.innerGradientStop = `${123 + normalizedPriority * 0.2}%`; // Center color extends further based on priority
                node.data.outerGradientStop = `${123 + normalizedPriority * 0.1}%`; // Quick transition to edge color
            } else {
                let scale = (maxPriority - node.data.totalPriority) / maxPriority * 10; // This scales the remaining to between 0 and 10
                let basePercentage = 90; // Base percentage for max priority
                node.data.innerGradientStop = `${90}%`; // 60% of the scale added to 90%
                node.data.outerGradientStop = `${100}%`; 
            }
            // Use normalizedPriority to adjust gradient transition
           
        });

        updateTreeColors(nodes);
        

        const defs = svg.select("defs") ;
        const gradients = defs.selectAll("radialGradient")
        .data(nodes.descendants(), (d) => d.data.id)
        .join(
            enter => enter.append("radialGradient").attr("id", d => `gradient-${d.data.id}`),
            update => update,
            exit => exit.remove()
        );

    // Add stops to each gradient
    gradients.selectAll("stop").data(d => [
        { offset: "0%", color: d.data.fillColor },
        { offset: d.data.innerGradientStop, color: d.data.fillColor },
        { offset: d.data.outerGradientStop, color: "red" }
    ])
    .join(
        enter => enter.append("stop"),
        update => update,
        exit => exit.remove()
    )
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);


  g.selectAll("circle")
    .data(nodes.descendants(), (d) => (d as d3.HierarchyCircularNode<WritableNode>).data.id)
    .join("circle")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("r", d => d.r)

// Radius is calculated by D3, taking into account the dynamic padding
    .attr("fill", d => `url(#gradient-${d.data.id})`)
    .attr("stroke-width", d => d.r * 0.03)  // Decrease stroke-width with depth
    .attr("class", d => {
       
    // Add 'circle' class to all, 'circle-selected' if it is the selected node
        let classes = d.data.id === currentSelectedNodeId ? "circle circle-selected" : "circle";
        // Add 'hoverable' class only if the node has children
        if (d.parent?.data.id == $selectedNodeStore?.id) {
        classes += " hoverable";
        }
        return classes;
    })
    .on("click", (event, d) => {
    //   event.stopPropagation();

      if (d.children != null || d.depth == 1) {
        handleCircleClick(d);
        
      } else if (!d.children && d.depth === selectedNode?.depth && d.parent?.data.id === selectedNode.parent?.data.id ) {
        handleCircleClickInternal(d)
        
        
        
      } else if (d.parent?.data.id == $selectedNodeStore?.id) {
        handleCircleClick(d); // Assuming you want to handle this case the same as if the node had children
        
        }
      else {
            handleCircleClickFarNode(d)
            
      }
 

      
    });


  
}


function convertToNodeType(d3Node: d3.HierarchyCircularNode<WritableNode> | null): Node | null {
  if (d3Node === null) {
    return null; // or return a default NodeType object if preferred
  }

  // If d3Node is not null, proceed with conversion
  return {
    id: d3Node.data.id,
    name: d3Node.data.name,
    parent_id: d3Node.parent ? d3Node.parent.data.id : null,
    value: d3Node.value ?? null,
  };
}


function handleCircleClick(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0



    // Check if the clicked node is the currently selected node
    if (selectedNode && d.data.id === selectedNode.data.id) {
        // Reset selection and zoom out

        
        const parent = nodes.find(node => node.depth === 0 && node.parent === null) || null;
        selectedNode = parent
        currentDepth = 0;
        selectedNodeId.set(parent.data.id)
        
        // Apply a zoom reset
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    } else {
        // Update the selected node and current depth for a new selection
        selectedNode = d;
        currentDepth = d.depth;
        selectedNodeId.set(d.data.id);
        // Calculate and apply zoom transformation for the new selection
        applyZoom(d);
        
    }

    // selectedNodeId.set(d.data.id)
  
    
    selectedNodeStore.set(convertToNodeType(selectedNode))
    // Refresh visuals with the updated selection or reset
    updateVisuals();
}

function handleCircleClickInternal(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0
   


    // Check if the clicked node is the currently selected node
        if (!d.children || d.children.length === 0) {

            if (selectedNode && d.data.id === selectedNode.data.id) {
                // Reset selection and zoom out
                const parent = nodes.find(node => node.depth === 0 && node.parent === null) || null;
                selectedNode = parent
                currentDepth = 0;
                selectedNodeId.set(parent.data.id)
                // Apply a zoom reset
                
        } else {

            selectedNode = d
            currentDepth = d.depth;
            selectedNodeId.set(d.data.id);
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);

         


        }
        
        applyZoom(d)
        selectedNodeStore.set(convertToNodeType(selectedNode))
        
        updateVisuals();
        return; // Exit the function early
    }
}

function handleCircleClickFarNode(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0



    // Check if the clicked node is the currently selected node
 

        if (selectedNode && d.data.id === selectedNode.data.id) {
                // Reset selection and zoom out
                
                
                const parent = nodes.find(node => node.depth === 0 && node.parent === null) || null;
                selectedNode = parent
                currentDepth = 0;
                selectedNodeId.set(parent.data.id)
                // Apply a zoom reset
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        } else {
           
            selectedNode = d.parent
            selectedNodeId.set(d.parent?.data.id);
            currentDepth = d.depth;
            applyZoomToParent(d)


        }
        
        
        
        selectedNodeStore.set(convertToNodeType(selectedNode))

        
        updateVisuals();
        return; // Exit the function early
  
}

function applyZoomToParent(d: d3.HierarchyCircularNode<WritableNode>) {
    d = d.parent
    if (!selectedNode) {
        // Reset zoom if no node is selected
        svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity);
        return;
    }

    // Compute the zoom transformation based on the selected node 'd'
    const targetDiameter = Math.min(width, height) * 0.9;
    const scale = targetDiameter / (d.r * 2);
    const translate = [width / 2 - scale * d.x, height / 2 - scale * d.y];
    // Here, 'transform' is declared and assigned before its use
    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

    // Now 'transform' is already assigned and can be safely used
    svg.transition().duration(750).call(zoom.transform as any, transform);
}


function applyZoom(d: d3.HierarchyCircularNode<WritableNode>) {
    if (!selectedNode) {
        // Reset zoom if no node is selected
        svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity);
        return;
    }

    // Compute the zoom transformation based on the selected node 'd'
    const targetDiameter = Math.min(width, height) * 0.9;
    const scale = targetDiameter / (d.r * 2);
    const translate = [width / 2 - scale * d.x, height / 2 - scale * d.y];
    // Here, 'transform' is declared and assigned before its use
    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

    // Now 'transform' is already assigned and can be safely used
    svg.transition().duration(750).call(zoom.transform as any, transform);
}

function shouldDisplayText(node: d3.HierarchyCircularNode<WritableNode>): boolean {
  // Only display text for nodes with radius larger than 10
  return node.r > 100;
}


function updateText(nodes: d3.HierarchyCircularNode<WritableNode>) {
    let selectedLeafParentId = null;
    if (selectedNode && (!selectedNode.children || selectedNode.children.length === 0)) {
        selectedLeafParentId = selectedNode.parent?.data.id;
      
        
    }
    const selectedNodeId = $selectedNodeStore.id;
    const selectedNodeDepth = selectedNode.depth;
    const selectedNodeParentId = selectedNode.parent?.data.id; 
    g.selectAll("text").remove();  // Remove all existing text elements
    g.selectAll("text")
    .data(
        nodes.descendants().filter(d =>
                (d.depth === selectedNodeDepth && d.parent?.data.id === selectedNodeParentId && d.data.id !== selectedNodeId) ||  // Same level and parent as the selected node, exclude the selected node
                (d.parent?.data.id === selectedNodeId) ||  // Children of the selected node
                (d.data.id === selectedNodeId && (!d.children || d.children.length === 0))  // Include the selected node only if it is a leaf
            ),
    d => (d as d3.HierarchyCircularNode<WritableNode>).data.name // Mapping node names for rendering
    )
      .join(
        enter => enter.append("text")
          .attr("transform", d => {
            const scale = (d.r * 0.02)   // Scale down text size as depth increases
            return `translate(${d.x},${d.y}) scale(${scale})`;
          })
          .text(d => d.data.name)
          .attr("class", "text")
      );
}
updateDimensions([50])
updateVisuals();

svg.on("wheel.zoom", event => event.preventDefault())
    .on("dblclick.zoom", null) ;

    svg.on("dblclick.zoom", null);

            svg.on("mousedown.zoom", null)
           .on("mousemove.zoom", null)
           .on("mouseup.zoom", null)
           .on("touchstart.zoom", null)
           .on("touchmove.zoom", null)
           .on("touchend.zoom", null);
 });



</script>



    <div id="circle-packing"></div>



<style>

    :global(.circle) {
        stroke: #000000;
   

    }
    :global(.circle-selected) {

        stroke: grey;

    }
    #circle-packing {
        width: 100%;
        margin: 0 auto;
        min-width: 150px;


    }


    :global(.hoverable:hover) {
  
        stroke: rebeccapurple; /* change color on hover */
    }




    svg {
        shape-rendering: optimizeSpeed;
        image-rendering: optimizeSpeed;
    }

    
  </style>