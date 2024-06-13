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
    const elements: { [key: number]: WritableNode } = {};
    let rootCandidates: WritableNode[] = [];

    // Create elements and identify root candidates
    data.forEach((d) => {
        const element: WritableNode = { 
            id: d.id, 
            name: d.name, 
            value: d.value, 
            children: [], 
            fillColor: "red", 
            state: d.state, 
            totalPriority: 0, 
            innerGradientStop: "", 
            outerGradientStop: "" 
        };
        elements[d.id] = element;
        if (d.parent_id === null) {
            rootCandidates.push(element);
        }
    });

    if (rootCandidates.length === 0) {
        console.error("No root node found in the data.");
        return null;
    } else if (rootCandidates.length > 1) {
        console.warn("Multiple root nodes found. Using the first one found as the root.");
    }

    // Build parent-child relationships
    data.forEach((d) => {
        if (d.parent_id !== null && elements[d.parent_id]) {
            elements[d.parent_id].children!.push(elements[d.id]);
        }
    });



    // Function to pack nodes layer by layer
    function packLayer(node: WritableNode, parentRadius: number) {
    if (!node.children || node.children.length === 0) return;

    const tempNode = {
        ...node,
        children: node.children.map(child => ({ ...child, children: [] }))
    };
    console.log(tempNode);
    
    const proportionalPadding = 100 * 0.01;
    const hierarchy = d3.hierarchy(tempNode).sum(d => d.value).sort((a, b) => b.data.value - a.data.value);
    const pack = d3.pack<WritableNode>()
        .size([parentRadius * 2, parentRadius * 2])

    const packed = pack(hierarchy);
    console.log(packed);
    
    packed.children!.forEach(child => {
        console.log(node.name, child.data.name);
        const originalChild = node.children!.find(c => c.id === child.data.id);
        if (originalChild) {
          
  
            originalChild.value = child.r * child.r * Math.PI; // Store radius squared times PI

            packLayer(originalChild, child.r); // Recursively pack the next layer
        }
    });

    // Set the parent node's value based on the total area of the children
}

    const root = rootCandidates[0];



    const rootHierarchy = d3.hierarchy(root).sum(d => d.value);
    const rootPack = d3.pack().size([200, 200]);
    rootPack(rootHierarchy); // Pack the root node directly
    packLayer(root, rootHierarchy.r); // Function you want to time



    
    return root;
}

// Function to simulate node values as if they had no children


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
    .sort(function(a, b) { return b.data.value - a.data.value; });

const scaleFactor = 1;
const proportionalPadding = width * 0.01;
const pack = d3.pack<WritableNode>()
   
    .size([width * scaleFactor, height * scaleFactor])
   

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
            return "#aecdeb";
        case "Planned":
            return "#6FB1FC";
        case "In Progress":
            return "#3A72B9";
        case "Completed":
            return "#00E08A";
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
            node.data.innerGradientStop = `${90}%`;
            node.data.outerGradientStop = `${100}%`;
        }
    });

    updateTreeColors(nodes);

    const defs = svg.select("defs");
    const gradients = defs.selectAll("radialGradient")
        .data(nodes.descendants(), (d) => d.data.id)
        .join(
            enter => enter.append("radialGradient").attr("id", d => `gradient-${d.data.id}`),
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

    function brighterColor(color: string, factor = 1.2) {
        const rgb = d3.color(color);
        if (!rgb) return color;
        rgb.r = Math.min(255, rgb.r * factor);
        rgb.g = Math.min(255, rgb.g * factor);
        rgb.b = Math.min(255, rgb.b * factor);
        return rgb.toString();
    }

    const shineGradients = defs.selectAll("linearGradient")
        .data(nodes.descendants(), (d) => d.data.id)
        .join(
            enter => enter.append("linearGradient").attr("id", d => `shine-gradient-${d.data.id}`),
            update => update,
            exit => exit.remove()
        )
        .attr("x1", () => `${Math.random() * 100}%`)
        .attr("y1", () => `${Math.random() * 100}%`)
        .attr("x2", () => `${Math.random() * 100}%`)
        .attr("y2", () => `${Math.random() * 100}%`);

    shineGradients.selectAll("stop").data(d => [
        { offset: "0%", color: d.data.fillColor },
        { offset: "50%", color: brighterColor(d.data.fillColor) },
        { offset: "100%", color: d.data.fillColor }
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
        .attr("fill", d => `url(#shine-gradient-${d.data.id})`)
        .attr("stroke-width", d => d.r * 0.01)
        .attr("class", d => {
            let classes = d.data.id === currentSelectedNodeId ? "circle circle-selected" : "circle";
            if (d.parent?.data.id == $selectedNodeStore?.id) {
                classes += " hoverable";
            }
            return classes;
        })
        .on("click", (event, d) => {
            if (d.children != null || d.depth == 1) {
                handleCircleClick(d);
            } else if (!d.children && d.depth === selectedNode?.depth && d.parent?.data.id === selectedNode.parent?.data.id ) {
                handleCircleClickInternal(d)
            } else if (d.parent?.data.id == $selectedNodeStore?.id) {
                handleCircleClick(d);
            } else {
                handleCircleClickFarNode(d);
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
          .text(d => `${d.data.name}`)

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