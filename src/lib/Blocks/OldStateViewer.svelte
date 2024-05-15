<script lang="ts">
    


    import { onMount } from 'svelte';
    import type { Node, Issue } from "../../types/collection"
    import * as d3 from 'd3';
    import { selectedNodeStore } from "../../stores";
    import { selectedNodeId, nodesDataStore, navigateNodeStore, issuesDataStore, sidebarWidthStore } from "../../stores";
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
            if (value[0] > 10) {
            

// Get current browser dimensions
            browserWidth = window.innerWidth;
            browserHeight = window.innerHeight;

            let parentWidth = (value[0] / 100) * browserWidth;

            let parentHeight = browserHeight * 0.4;

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

      
            if (isFirstLoad) {
                data = createHierarchy(value)
            } else {
                updateVisuals();
            }

    

            isFirstLoad = false; // Update flag after first run
        }); // logs 'got a subscriber', then '1'

        selectedNodeStore.subscribe(value => {
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
    const k = width / (node.r * 2.5); // Adjust the denominator to scale to 80% of the width
    const x = width / 2 - k * node.x;
    const y = height / 2 - k * node.y;

    const transform = d3.zoomIdentity.translate(x, y).scale(k);
    svg.call(zoom.transform, transform); // Apply the transformation without transition
}

function centerOnNodeALL(node) {
    // Constants to control the maximum visible size of the circle
    const maxWidthRatio = 0.8; // Circle should cover up to 80% of the width
    const maxHeightRatio = 0.8; // Circle should cover up to 80% of the height

    // Calculate potential scales for both width and height to keep the circle within view
    const scaleWidth = (width * maxWidthRatio) / (node.r * 2); // Scale based on width
    const scaleHeight = (height * maxHeightRatio) / (node.r * 2); // Scale based on height

    // Use the smaller scale to ensure the circle fits in both dimensions without clipping
    const k = Math.min(scaleWidth, scaleHeight);

    const x = width / 2 - k * node.x;
    const y = height / 2 - k * node.y;

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
    d3.select("#circle-packingOld svg")
        .attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    }
    
    const svg = d3.select("#circle-packingOld")
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
        console.log("updates");
        
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


selectedNode = nodes.find(n => n.data.id === $selectedNodeId);
// Apply the pack layout to your hierarchy








    updateCirclesOLD(nodes);
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

    function updateCirclesOLD(nodes: d3.HierarchyCircularNode<WritableNode>) {
    // Ensure unique gradient IDs by appending a unique component-specific identifier
    const componentId = 'uniqueComponentId';  // Replace with actual unique identifier

    let maxPriority = d3.max(nodes.descendants(), d => d.data.totalPriority) || 1;

    nodes.descendants().forEach(node => {
        node.data.totalPriority = getNestedIssuesTotalPriority(node.data.id, $nodesDataStore, $issuesDataStore);

        let normalizedPriority = (node.data.totalPriority / maxPriority) * 100;

        if (node.data.totalPriority === 0) {
            node.data.innerGradientStop = `${123 + normalizedPriority * 0.2}%`;
            node.data.outerGradientStop = `${123 + normalizedPriority * 0.1}%`;
        } else {
            let scale = (maxPriority - node.data.totalPriority) / maxPriority * 10;
            let basePercentage = 90;
            node.data.innerGradientStop = `${basePercentage}%`;
            node.data.outerGradientStop = `${100}%`;
        }
    });

    updateTreeColors(nodes);

    const defs = svg.select("defs");
    const gradients = defs.selectAll("radialGradient")
        .data(nodes.descendants(), (d) => d.data.id)
        .join(
            enter => enter.append("radialGradient").attr("id", d => `gradient-${componentId}-${d.data.id}`),
            update => update,
            exit => exit.remove()
        );

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
        .attr("fill", d => `url(#gradient-${componentId}-${d.data.id})`)
        .attr("stroke-width", d => d.r * 0.03)
        .attr("class", d => {
            let classes = d.data.id === currentSelectedNodeId ? "circle circle-selected" : "circle";
            return classes;
        });
}





function handleCircleClick(d: d3.HierarchyCircularNode<WritableNode>) {
    const maxDepth = d3.max(nodes.descendants(), d => d.depth) || 0



    // Check if the clicked node is the currently selected node
    if (selectedNode && d.data.id === selectedNode.data.id) {
        // Reset selection and zoom out
        const parent = nodes.find(node => node.depth === 0 && node.parent === null) || null;
        selectedNode = parent
        currentDepth = 0;
               

        
        // Apply a zoom reset
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    } else {
        // Update the selected node and current depth for a new selection
        selectedNode = d;
        currentDepth = d.depth;
  
        // Calculate and apply zoom transformation for the new selection
        applyZoom(d);
        
    }

    // selectedNodeId.set(d.data.id)
  
    

    // Refresh visuals with the updated selection or reset
    updateVisuals();
}





function applyZoom(d: d3.HierarchyCircularNode<WritableNode>) {

    if (!selectedNode) {
        // Reset zoom if no node is selected
        svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity);
        return;
    }

    // Compute the zoom transformation based on the selected node 'd'
    const targetDiameter = Math.min(width, height) * 0.8;
    const scale = targetDiameter / (d.r * 2);
    const translate = [width / 2 - scale * d.x, height / 2 - scale * d.y];
    // Here, 'transform' is declared and assigned before its use
    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

    // Now 'transform' is already assigned and can be safely used
    svg.transition().duration(750).call(zoom.transform as any, transform);
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



    <div id="circle-packingOld"></div>



<style>

    :global(.circle) {
        stroke: #000000;
   

    }
    :global(.circle-selected) {

        stroke: grey;

    }
    #circle-packingOld {
        width: 60%;
        max-width: 50%;

    

    }


    :global(.hoverable:hover) {
  
        stroke: rebeccapurple; /* change color on hover */
    }




    svg {
        shape-rendering: optimizeSpeed;
        image-rendering: optimizeSpeed;
    }

    
  </style>