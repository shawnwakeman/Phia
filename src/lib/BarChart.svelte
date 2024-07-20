<script lang="ts">
    


    import { onMount } from 'svelte';
    import type { Node, Issue, Blocks } from "../types/collection"
    import * as d3 from 'd3';
 
    import { selectedNodeStore, selectedNodeId, nodesDataStore, navigateNodeStore, issuesDataStore, sidebarWidthStore, targetStatesStore, currentBlock } from "$lib/stores";
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
    isVisible: boolean
};

        

    let currentSelectedNodeId: number;
        selectedNodeId.subscribe(value => {
            currentSelectedNodeId = value;
            
        });


    let nodes: d3.HierarchyCircularNode<WritableNode>;    
    let selectedNode: d3.HierarchyCircularNode<WritableNode> | null = nodes;
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

    
// function generateDummyData(count: number): Node[] {
//     const data: Node[] = [];
//     for (let i = 0; i < count; i++) {
//         data.push({
//             id: i,
//             parent_id: i === 0 ? null : 0, // Random parent_id
//             name: `Element ${i}`,
//             value: Math.floor(Math.random() * 100) + 1, // Random value
//             state: 'Open' // Example state
//         });
//     }
//     return data;
// }

function createHierarchy(data: Node[]): WritableNode | null {
    
    console.log("mew shi");
    
  
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
    
    const proportionalPadding = 100 * 0.01;
    const hierarchy = d3.hierarchy(tempNode).sum(d => d.value).sort((a, b) => b.data.value - a.data.value);
    const pack = d3.pack<WritableNode>()
        .size([parentRadius * 2, parentRadius * 2])

    const packed = pack(hierarchy);
    
    packed.children!.forEach(child => {
        
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


    let data: WritableNode | null;
    let isFirstLoad = true; 
    let width: number = 100;
    let halfWidth = 100;
    let height: number = 100;
    let callCount = 0;
    onMount(async () => {

        const parentDiv = document.getElementById('state-wrapper');
        function updateDimensions(value, viewBoxResize = false) {


            callCount++;
            console.log(callCount);
            console.log(value);
            
            value = value + 3.3
            if (value < 1) {
                console.log("sd");
                
                value = 100
            }
            if (value > 15) {
                const parentRect = parentDiv.getBoundingClientRect();
                const parentWidth = parentRect.width;
                halfWidth = (value / 100) * parentRect.width;
                const parentHeight = parentRect.height * 1.5;
                const aspectRatio = parentWidth / parentHeight;
                const innerWidth = Math.min(aspectRatio * parentHeight, parentWidth);
        

                if (!isFirstLoad) {
                    width = parentWidth;
                    height = parentHeight;
                    console.log(halfWidth,height);
                    if (viewBoxResize) {
                        updateViewBox(parentWidth, parentHeight);
                    }
                    if (selectedNode) {
                        applyResize(selectedNode);
                    } else {
                        updateVisuals()
                    }
                    
                }
            }
        }


        sidebarWidthStore.subscribe((value) => {
            updateDimensions(value)
        
        });


        window.addEventListener('resize', () => {
          
            updateDimensions($sidebarWidthStore, true);
               
           
        });

        currentBlock.subscribe(value => {
            if (!isFirstLoad) {
                updateVisuals();
            }
      
        });


        targetStatesStore.subscribe(value => {
            if (!isFirstLoad) {
                
                updateVisuals();
          
                
                
            }
    
        });


   
        nodesDataStore.subscribe((value) => {
            data = createHierarchy(value)
            console.log("change");
            
            if (!isFirstLoad) {
                updateVisuals();
                if (selectedNode) {
                    centerOnNode(selectedNode);
                }
            }
            console.log("asds");
            
            isFirstLoad = false;
        }); 





        navigateNodeStore.subscribe(value => {
            if (value) {
                if (nodes && !isFirstLoad) {
                    let currentNode = nodes.find(d => d.data.id === value.id);
                    handleCircleClick(currentNode)
                }
            }
        });

     



    
    function centerOnNode(node) {
        console.log("asd");
        
        const maxWidthRatio = 0.8; // Circle should cover up to 80% of the width
        const maxHeightRatio = 0.8; // Circle should cover up to 80% of the height

        // Calculate potential scales for both width and height to keep the circle within view
        const scaleWidth = (halfWidth * maxWidthRatio) / (node.r * 2); // Scale based on width
        const scaleHeight = ((height / 1.5 ) * maxHeightRatio) / (node.r * 2); // Scale based on height

        // Use the smaller scale to ensure the circle fits in both dimensions without clipping
        const k = Math.min(scaleWidth, scaleHeight);

        // Center the node within the new full screen dimensions
        const x = halfWidth / 2 - k * node.x;
        const y = (height / 1.5 ) / 2 - k * node.y;

        const transform = d3.zoomIdentity.translate(x, y).scale(k);
        g     
        .call(zoom.transform, transform)
        .attr("transform", `translate(${x},${y}) scale(${k})`)
    }

    function applyZoom(node) {

       
        
 
        // Constants to control the maximum visible size of the circle
        const maxWidthRatio = 0.8; // Circle should cover up to 80% of the width
        const maxHeightRatio = 0.8; // Circle should cover up to 80% of the height

        // Calculate potential scales for both width and height to keep the circle within view
        const scaleWidth = (halfWidth * maxWidthRatio) / (node.r * 2); // Scale based on width
        const scaleHeight = ((height / 1.5 ) * maxHeightRatio) / (node.r * 2); // Scale based on height

        // Use the smaller scale to ensure the circle fits in both dimensions without clipping
        const k = Math.min(scaleWidth, scaleHeight);

        // Center the node within the new full screen dimensions
        const x = halfWidth / 2 - k * node.x;
        const y = (height / 1.5 ) / 2 - k * node.y;

    
        const selectedDepth = selectedNode ? selectedNode.depth : 0;
        let duration = Math.min(Math.abs(node.depth - selectedDepth) * 20 + 750, 900); // Cap duration to avoid long transitions

        

        
        
        const transform = d3.zoomIdentity.translate(x, y).scale(k);
    
            g.transition()
            .duration(750)
            .ease(d3.easeCubicInOut)
            .call(zoom.transform, transform)
            .attr("transform", `translate(${x},${y}) scale(${k})`)


            
        
    }


    function applyResize(node) {

       

        // Constants to control the maximum visible size of the circle
        const maxWidthRatio = 0.8; // Circle should cover up to 80% of the width
        const maxHeightRatio = 0.8; // Circle should cover up to 80% of the height

        // Calculate potential scales for both width and height to keep the circle within view
        const scaleWidth = (halfWidth * maxWidthRatio) / (node.r * 2); // Scale based on width
        const scaleHeight = ((height / 1.5 ) * maxHeightRatio) / (node.r * 2); // Scale based on height

        // Use the smaller scale to ensure the circle fits in both dimensions without clipping
        const k = Math.min(scaleWidth, scaleHeight);

        // Center the node within the new full screen dimensions
        const x = halfWidth / 2 - k * node.x ;
        const y = (height / 1.5 ) / 2 - k * node.y;


        const selectedDepth = selectedNode ? selectedNode.depth : 0;
        let duration = Math.min(Math.abs(node.depth - selectedDepth) * 20 + 750, 900); // Cap duration to avoid long transitions





        

        g.interrupt();

        // Apply the new transition
        g.transition()
            .duration(500)
            .ease(d3.easePoly.exponent(2))
            .attr("transform", `translate(${x},${y}) scale(${k})`);


            

        }




    function zoomed(event) {
    
        
    // Get the transform
        const transform = event.transform;

        // Update the transform of the group
        g.attr('transform', transform);

        // Calculate the visible bounds
        const visibleXMin = -transform.x / transform.k;
        const visibleXMax = (width - transform.x) / transform.k;
        const visibleYMin = -transform.y / transform.k;
        const visibleYMax = (height - transform.y) / transform.k;

        // Function to check if an element is visible
        function isVisible(d) {
            return d.x + d.r > visibleXMin && d.x - d.r < visibleXMax && d.y + d.r > visibleYMin && d.y - d.r < visibleYMax;
        }

        // Update the visibility of the elements
        g.selectAll('circle, text.text-node').each(function(d) {
            const element = d3.select(this);
            if (isVisible(d)) {
                element.style('display', 'block');
            } else {
                element.style('display', 'none');
            }
        });

    }






    // Create SVG element


   
    const zoom = d3.zoom<SVGSVGElement, unknown>()

    .on("zoom", (event) => {

        
        zoomed(event)
  

    });

    

    function updateViewBox(newWidth: number, newHeight: number) {
        d3.select("#circle-packing svg")
            .attr("viewBox", `0 0 ${newWidth} ${newHeight}`);


   
    }
    

    const svg = d3.select("#circle-packing")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("text-anchor", "middle")
    .style("font-size", "12px");

// Append a rectangle as the background box
    svg.call(zoom as any);


    const g = svg.append("g");




    svg.append("defs")
        .append("pattern")
        .attr("id", "dot-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 100)
        .attr("height", 100)
        .append("circle")
        .attr("cx", 20)
        .attr("cy", 20)
        .attr("r", 2)
        .attr("fill", "#c2c2c1");


    g.append("rect")
        .attr("width", width * 1000 )
        .attr("height", height * 1000)
        .attr("fill", "url(#dot-pattern)")
        .attr("transform", "translate(-2010, -4000)");


    if (data === null) {
        console.error("Failed to create hierarchical data.");
        return; // or return some fallback value if needed
    }


   

    let targetStateMap : Map<any, any>;
    function updateVisuals() {
        console.trace("update");
        
        if (!data) {
            console.error("Failed to create hierarchical data.");
            return;
        }


        const root = d3.hierarchy<WritableNode>(data)
            .sum(d => d.value ?? 0) // Only use the node's own value
            .sort(function(a, b) { return b.data.value - a.data.value; });


        const pack = d3.pack<WritableNode>()
            .size([width, height])

        nodes = pack(root);


        if (!isFirstLoad) { selectedNode = nodes.find(n => n.data.id === $selectedNodeId); }
        console.log(nodes, "nodes");
        
        targetStateMap  = createTargetStateMap($targetStatesStore);
        
        shrinkChildrenAndRepack(root);
        updateCircles(nodes);
        updateText(nodes);
        applyResize(selectedNode)
    
    }

  

    function shrinkChildrenAndRepack(node) {
        if (!node.children) return;

        // Repack children with a new hierarchy

        const padding = node.r * 0.15
        const childrenRoot = d3.hierarchy({ children: node.children })
            .sum(d => d.value ?? 0);

        const childrenPack = d3.pack()
            .size([node.r * 2 - padding * 2, node.r * 2 - padding * 2])
        

        childrenPack(childrenRoot);

        // Adjust children positions to fit within the parent node with padding
        node.children.forEach((child, i) => {
            const packedChild = childrenRoot.children[i];
            child.x = node.x + packedChild.x - node.r + padding;
            child.y = node.y + packedChild.y - node.r + padding;
            child.r = packedChild.r;
        });

        // Recursively apply to children
        node.children.forEach(child => shrinkChildrenAndRepack(child));
    }

    function getColorByStatus(status) {
        switch (status) {
            case "Open":
                return "#c4def4 ";
            case "Planned":
                return "#7CADDD";
            case "In Progress":
                return "#3A72B9";
            case "Completed":
                return "#0AD196";
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

        if (totalPriority === 0) { return "#cccccc"; } // Return a default neutral color
            // Prevent division by zero if totalPriority is unexpectedly zero
            
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

    function darkerColor(color: string, factor = 0.55) {
        const rgb = d3.color(color);
        if (!rgb) return color;
        rgb.r = Math.max(0, rgb.r * factor);
        rgb.g = Math.max(0, rgb.g * factor);
        rgb.b = Math.max(0, rgb.b * factor);
        return rgb.toString();
    }

    function darkerAndDesaturatedColor(color: string, factor = 0.55, saturationFactor = 0.3) {
    const hsl = d3.hsl(color);
    if (!hsl) return color;
    hsl.l = Math.max(0, hsl.l * factor); // darken
    hsl.s = hsl.s * saturationFactor; // reduce saturation
    return hsl.toString();
}



    function hashData(data: any): string {
        return JSON.stringify(data);
    }

    let previousDataHash = "";

    function getMatchingTargetState(nodeId: number): {
        id: number;
        node_id: number;
        project_id: number;
        snapshot_id: number;
        target_state: string;
    } | undefined {
        return $targetStatesStore.find(state => state.node_id === nodeId && state.snapshot_id === $currentBlock?.snapshot_id);
    }

    function createTargetStateMap(targetStates) {
        const targetStateMap = new Map();
        targetStates.forEach(state => {
            if (state.snapshot_id === $currentBlock?.snapshot_id) {
                targetStateMap.set(state.node_id, true);
            }
        });
        return targetStateMap;
    }




    function hasMatchingTargetStateOrChildren(node, targetStateMap) {
        if (targetStateMap.has(node.data.id)) {
            return true;
        }
        if (node.children) {
            for (const child of node.children) {
                if (hasMatchingTargetStateOrChildren(child, targetStateMap)) {
                    return true;
                }
            }
        }
        return false;
    }



    function updateCircles(nodes: d3.HierarchyCircularNode<WritableNode>) {
        let maxPriority = d3.max(nodes.descendants(), d => d.data.totalPriority) || 1; // Find maximum totalPriority for normalization

        let gradientCache = new Map();

        nodes.descendants().forEach(node => {
            const id = node.data.id;
            const totalPriority = getNestedIssuesTotalPriority(id, $nodesDataStore, $issuesDataStore);
            node.data.totalPriority = totalPriority;

            if (!gradientCache.has(id)) {
                const normalizedPriority = (totalPriority / maxPriority) * 100;

                node.data.innerGradientStop = totalPriority === 0 ? `${121}%` : `${90}%`;
                node.data.outerGradientStop = `${110}%`;

                gradientCache.set(id, {
                    inner: node.data.innerGradientStop,
                    outer: node.data.outerGradientStop
                });
            } else {
                const cached = gradientCache.get(id);
                node.data.innerGradientStop = cached.inner;
                node.data.outerGradientStop = cached.outer;
            }
        });

        // Calculate the hash of the current data
        let currentDataHash = hashData(nodes.descendants().map(d => d.data));

        // Call updateTreeColors only if the data has changed
        if (currentDataHash !== previousDataHash) {
            updateTreeColors(nodes);
            previousDataHash = currentDataHash;
        }

        const defs = svg.select("defs");


        console.log(nodes.depth);
        
        // Filter nodes to render only up to 3 levels deep


        
       

        // Add stops to each gradient
        const gradients = defs.selectAll("radialGradient")
            .data(nodes.descendants().filter(d => d.data.totalPriority !== 0), d => d.data.id)
            .join(
                enter => enter.append("radialGradient").attr("id", d => `gradient-${d.data.id}`),
                update => update,
                exit => exit.remove()
            );

        gradients.each(function (d) {
            const gradient = d3.select(this);
            const stops = [
                { offset: d.data.innerGradientStop, color: d.data.fillColor },
                { offset: d.data.outerGradientStop, color: "#654ea3" }
            ];

            gradient.selectAll("stop")
                .data(stops)
                .join(
                    enter => enter.append("stop"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("offset", stop => stop.offset)
                .attr("stop-color", stop => stop.color);
        });


        
        
        g.selectAll("circle")
        .data(nodes.descendants(), d => (d as d3.HierarchyCircularNode<WritableNode>).data.id)
            .join(
                enter => enter.append("circle"),
                update => update,
                exit => exit.remove()
            )
 
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("r", d => d.r * 0.975)
            .attr("fill", d => {
                if ($currentBlock) {
                    const hasTargetState = hasMatchingTargetStateOrChildren(d, targetStateMap);
                    
                    if (!hasTargetState) {
                        return darkerAndDesaturatedColor(d.data.fillColor);
                    }
                }
               

                return d.data.totalPriority === 0 ? d.data.fillColor : `url(#gradient-${d.data.id})`;
            })
            .attr("stroke-width", d => {
                if (d.depth === 0) { // Assuming depth 0 means it's the parent node
                    return 10; // Set the stroke width for the parent separately (example: 2)
                }
                const depthSquared = d.depth * d.depth;
                const adjustedDepth = depthSquared !== 0 ? (1 / depthSquared) : 0; // Avoid division by zero
                const radiusContribution = d.r * 0.1;
                const depthContribution = adjustedDepth * 0.06;

                return (radiusContribution + depthContribution) / 2;
            })
            .attr("stroke", d => {
                    const hasTargetState = getMatchingTargetState(d.data.id);
                 
                    
                    if (hasTargetState) {
                        console.log(hasTargetState.target_state);
                        
                        return getColorByStatus(hasTargetState.target_state);
                    } else {
                
                        return d.data.totalPriority === 0 ? darkerColor(d.data.fillColor) : '#654ea3'
                    }
                    
                    
            })
            .attr("class", d => {
                let classes = "circle";
                if (d.data.id === currentSelectedNodeId) {
                    classes += " circle-selected";
                }
                if (d.parent?.data.id === $selectedNodeStore?.id) {
                    classes += " hoverable";
                }
                return classes;
            })
            
            .on("click", (event, d) => {
                if (d.children != null || d.depth == 1) {
                    handleCircleClick(d);
                } else if (!d.children && d.depth === selectedNode?.depth && d.parent?.data.id === selectedNode.parent?.data.id) {
                    handleCircleClickInternal(d);
                } else if (d.parent?.data.id == $selectedNodeStore?.id) {
                    handleCircleClick(d); // Assuming you want to handle this case the same as if the node had children
                } else {
                    handleCircleClickFarNode(d);
                }
            });
    }


    function convertToNodeType(d3Node: d3.HierarchyCircularNode<WritableNode> | null): Node | null {
        if (!d3Node) return null;
        const { id, name, value } = d3Node.data;
        const parent_id = d3Node.parent ? d3Node.parent.data.id : null;
        return { id, name, parent_id, value: value ?? null };
    }


    function updateCircleClasses() {
        g.selectAll("circle")
        .attr("class", d => {
            const classes = ["circle"];
            if (d.data.id === $selectedNodeStore?.id) classes.push("circle-selected");
            if (d.parent?.data.id === $selectedNodeStore?.id) classes.push("hoverable");
            return classes.join(" ");
        });
    }


    function handleCircleClick(d: d3.HierarchyCircularNode<WritableNode>) {
        if (selectedNode && d.data.id === selectedNode.data.id) {
            // Reset selection and zoom out
            applyZoom(nodes);
            selectedNode = nodes;
          
            selectedNodeId.set(nodes.data.id);
          
        } else {
            // Update the selected node and current depth for a new selection
            applyZoom(d);
            selectedNode = d;
            
            selectedNodeId.set(d.data.id);
           
        }

        selectedNodeStore.set(convertToNodeType(selectedNode));
        updateText(nodes);
        updateCircleClasses();
    }

    function handleCircleClickInternal(d: d3.HierarchyCircularNode<WritableNode>) {
        if (!d.children || d.children.length === 0) {
            if (selectedNode && d.data.id === selectedNode.data.id) {
                applyZoom(nodes);
                selectedNode = nodes;
          
                selectedNodeId.set(nodes.data.id);
               
            } else {
                applyZoom(d);
                selectedNode = d;
        
                selectedNodeId.set(d.data.id);
               
            }

            selectedNodeStore.set(convertToNodeType(selectedNode));
            updateText(nodes);
            updateCircleClasses();
            return; 
        }
    }


    function handleCircleClickFarNode(d: d3.HierarchyCircularNode<WritableNode>) {
        if (selectedNode && d.data.id === selectedNode.data.id) {
            // Reset selection and zoom out
            applyZoom(nodes);
            const parent = nodes.find(node => node.depth === 0 && !node.parent) || null;
            selectedNode = parent;
       
            selectedNodeId.set(parent.data.id);
          
        } else {
            applyZoom(d.parent);
            selectedNode = d.parent;
     
            selectedNodeId.set(d.parent?.data.id);
       
        }

        selectedNodeStore.set(convertToNodeType(selectedNode));
        updateText(nodes);
        updateCircleClasses();
    }


    function updateText(nodes: d3.HierarchyCircularNode<WritableNode>) {
  

    const selectedNodeId = $selectedNodeStore.id;
    const selectedNodeDepth = selectedNode.depth;
    const selectedNodeParentId = selectedNode.parent?.data.id;

    const isAtSameDepthAndParent = (d) => d.depth === selectedNodeDepth && d.parent?.data.id === selectedNodeParentId && d.data.id !== selectedNodeId;
    const isChildOfSelectedNode = (d) => d.parent?.data.id === selectedNodeId;
    const isSelectedLeafNode = (d) => d.data.id === selectedNodeId && (!d.children || d.children.length === 0);

    const filteredNodes = nodes.descendants().filter(d =>
        isAtSameDepthAndParent(d) ||
        isChildOfSelectedNode(d) ||
        isSelectedLeafNode(d)
    );

    const texts = g.selectAll("g.text-group")
    .data(filteredNodes, d => d.data.id)
    .join(
        enter => {
            const enterGroups = enter.append("g")
                .attr("class", "text-group")
                .attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r * 0.02})`);

            const enterTexts = enterGroups.append("text")
                .attr("class", "text-node font-default font-medium")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text(d => d.data.name)
                .on("click", handleCircleClick);

            // Only wrap text if the radius is large enough
            enterTexts.filter(d => d.r > 10)
                .call(wrap, 10);

            // Reduce text quality for small nodes
            enterTexts.filter(d => d.r <= 10)
                .attr("class", "text-node font-default font-small");

            // Add target state text if it exists
            if ($currentBlock) {
                enterGroups.append("text")
                .attr("class", "text-node font-default font-small")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .style("font-size", "0.6em") // Smaller font size
                .attr("dy", "1.2em") // Offset to position below the main text
                .text(d => {
                    const hasTargetState = getMatchingTargetState(d.data.id);
                    return hasTargetState ? `${d.data.state} -> ${hasTargetState.target_state}` : "";
                });

            return enterGroups;
            }
            
        },
        update => {
            update.select("text")
                .text(d => d.data.name)  // Ensure the text is updated
                .attr("class", d => d.r > 10 ? "text-node font-default font-medium" : "text-node font-default font-small")
                .filter(d => d.r > 10)
                .call(wrap, 10);

            // Update target state text if it exists
            update.select("text + text")
                .text(d => {
                    const hasTargetState = getMatchingTargetState(d.data.id);
                    return hasTargetState ? `${d.data.state} -> ${hasTargetState.target_state}`  : "";
                });

            update.attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r * 0.02})`);

            return update;
        },
        exit => exit.remove()
    );

// Only update and transform visible texts
g.selectAll("g.text-group").filter(d => d.r > 1) // skip nodes that are too small
    .attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r * 0.02})`);

// Optionally reduce update frequency with requestAnimationFrame
requestAnimationFrame(() => {
    g.selectAll("g.text-group").attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r * 0.02})`);
});
}


function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y") !== null ? text.attr('y') : 0,
            dy = text.attr("dy") !== null ? parseFloat(text.attr("dy")) : 0,
            tspanElements = [],
            ellipsis = '...';

        // Function to split long words
        function splitLongWord(word, width) {
            let parts = [];
            while (word.length > width) {
                parts.push(word.slice(0, width));
                word = word.slice(width);
            }
            parts.push(word);
            return parts;
        }

        // Construct lines from words
        while (word = words.pop()) {
            let prospectiveLine = line.length ? line.join(" ") + " " + word : word;
            if (prospectiveLine.length > width) {
                if (word.length > width) {
                    let splitParts = splitLongWord(word, width);
                    while (splitParts.length) {
                        if (line.join(" ").length > 0) {
                            tspanElements.push(line.join(" ").trim());
                        }
                        line = [splitParts.shift()];
                    }
                } else {
                    tspanElements.push(line.join(" ").trim());
                    line = [word];
                }
            } else {
                line.push(word);
            }
        }
        if (line.length > 0) {
            tspanElements.push(line.join(" ").trim());
        }

        // Check if text is cut off and needs ellipsis
        let totalText = tspanElements.join(' ');
        if (tspanElements.length > 2 || totalText.length > 2 * width) {
            let truncatedText = totalText.slice(0, (2 * width) - ellipsis.length).trim();
            truncatedText += ellipsis;
            tspanElements = truncatedText.match(new RegExp('.{1,' + width + '}', 'g'));
            tspanElements = tspanElements.slice(0, 2); // Ensure it only takes up to 2 lines
        }

        // Clear existing text and compute the vertical adjustment
        text.text(null);
        const totalLines = tspanElements.length;
        const initialYOffset = -((totalLines - 1) / 2) * lineHeight;

        // Append each line as a tspan, adjusting for vertical centering
        tspanElements.forEach((lineText, index) => {
            text.append("tspan")
                .attr("x", 0)
                .attr("y", y)
                .attr("dy", (initialYOffset + (index * lineHeight)) + "em")
                .text(lineText);
        });
    });
}






    updateDimensions(46.5, true)


    svg.on("wheel.zoom dblclick.zoom mousedown.zoom mousemove.zoom mouseup.zoom touchstart.zoom touchmove.zoom touchend.zoom", null);

});


</script>


<div id="circle-packing"></div>



<style>




    

    :global(.circle-selected) {
        stroke: rgb(0, 255, 255);
        transition: fill 0.3s ease, stroke-width 0.3s ease;
        filter: drop-shadow(0 0 0.75rem rgb(20, 90, 220));
        
    }



    #circle-packing {
        width: 100%;
        margin: 0 auto;
        min-width: 150px;
        background: radial-gradient(circle at 90% top, hsl(222, 45%, 7%) 0%, hsla(230, 25%, 4%, 0.774) 50%);     
        
    }

    :global(.text-node) {
        fill: #0e1525;       /* Text color */
        user-select: none;
    }



    :global(.hoverable:hover) {
        stroke: rgb(240, 88, 0);
    }


  



</style>