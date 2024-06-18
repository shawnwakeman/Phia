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
    isVisible: boolean
};

        

    let currentSelectedNodeId: number;
        selectedNodeId.subscribe(value => {
            currentSelectedNodeId = value;
            
        });


        
    let nodes: d3.HierarchyCircularNode<WritableNode>;    
    let originalNodes: d3.HierarchyCircularNode<WritableNode>;
    let lastNode: WritableNode; 
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

    
function generateDummyData(count: number): Node[] {
    const data: Node[] = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i,
            parent_id: i === 0 ? null : 0, // Random parent_id
            name: `Element ${i}`,
            value: Math.floor(Math.random() * 100) + 1, // Random value
            state: 'Open' // Example state
        });
    }
    return data;
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
  
        function updateDimensions(value) {
            callCount++;
            console.log(callCount);
            
            
            if (value[0] > 15) {
                const parentRect = parentDiv.getBoundingClientRect();
                const parentWidth = parentRect.width;
                halfWidth = (value[0] / 100) * parentRect.width;
                const parentHeight = parentRect.height;
                const aspectRatio = parentWidth / parentHeight;
                const innerWidth = Math.min(aspectRatio * parentHeight, parentWidth);
                const innerHeight = innerWidth / aspectRatio;

                if (!isFirstLoad) {
                    width = innerWidth;
                    height = innerHeight;
                    console.log(halfWidth,height);
                    updateViewBox(innerWidth, innerHeight);
                    updateVisuals();
                }
            }
        }


        sidebarWidthStore.subscribe((value) => {
            updateDimensions(value)
        
        });


        window.addEventListener('resize', () => {
          
            updateDimensions($sidebarWidthStore);
               
           
        });

   
        nodesDataStore.subscribe((value) => {
            data = createHierarchy(value)

            if (!isFirstLoad) {
                updateVisuals();
                if (selectedNode) {
                    centerOnNode(selectedNode);
                }
            }
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
        const scaleHeight = (height * maxHeightRatio) / (node.r * 2); // Scale based on height

        // Use the smaller scale to ensure the circle fits in both dimensions without clipping
        const k = Math.min(scaleWidth, scaleHeight);

        // Center the node within the new full screen dimensions
        const x = halfWidth / 2 - k * node.x;
        const y = height / 2 - k * node.y;

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
        const scaleHeight = (height * maxHeightRatio) / (node.r * 2); // Scale based on height

        // Use the smaller scale to ensure the circle fits in both dimensions without clipping
        const k = Math.min(scaleWidth, scaleHeight);

        // Center the node within the new full screen dimensions
        const x = halfWidth / 2 - k * node.x;
        const y = height / 2 - k * node.y;

    
        const selectedDepth = selectedNode ? selectedNode.depth : 0;
        let duration = Math.abs(node.depth - selectedDepth) * 10 + 750 // fix
        

        
        
        const transform = d3.zoomIdentity.translate(x, y).scale(k);
            g.transition()
            .duration(duration)
  
            .call(zoom.transform, transform)
            .attr("transform", `translate(${x},${y}) scale(${k})`)
        
    }



    function zoomed(event) {
    
        
    // Get the transform
        const transform = event.transform;

        // Update the transform of the group
        g.attr('transform', transform);

        // Calculate the visible bounds
        const visibleXMin = -transform.x / transform.k;
        const visibleXMax = (halfWidth - transform.x) / transform.k;
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
        g.attr("transform", event.transform);
      
        console.log(event.transform.k);
        
        zoomed(event)
  
        

        // Use debounced function to handle updates

    });

    

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
    .style("font-size", "12px");

// Append a rectangle as the background box
    svg.call(zoom as any);


    const g = svg.append("g");




    svg.append("defs")
        .append("pattern")
        .attr("id", "dot-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 80)
        .attr("height", 80)
        .append("circle")
        .attr("cx", 20)
        .attr("cy", 20)
        .attr("r", 4)
        .attr("fill", "#c2c2c1");


    g.append("rect")
        .attr("width", 10010)
        .attr("height", 5010)
        .attr("fill", "url(#dot-pattern)")
        .attr("transform", "translate(-2010, -1000)");


    if (data === null) {
        console.error("Failed to create hierarchical data.");
        return; // or return some fallback value if needed
    }


    let selectedNode: d3.HierarchyCircularNode<WritableNode> | null = nodes;


    function updateVisuals() {
        
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
            

        shrinkChildrenAndRepack(root);
        updateCircles(nodes);
        updateText(nodes);
        applyZoom(selectedNode)
    
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


    function hashData(data: any): string {
        return JSON.stringify(data);
    }

    let previousDataHash = "";

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

        let filter = defs.select("#drop-shadow");

        if (filter.empty()) {
            filter = defs.append("filter")
                .attr("id", "drop-shadow")
                .attr("height", "130%");

            filter.append("feGaussianBlur")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", 10)
                .attr("result", "blur");

            filter.append("feOffset")
                .attr("in", "blur")
                .attr("dx", 2)
                .attr("dy", 3)
                .attr("result", "offsetBlur");

            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "offsetBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");
        }

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


        const filteredNodes = nodes.descendants().filter(d => d.depth <= nodes.depth + 4);
        
        g.selectAll("circle")
        .data(filteredNodes, d => (d as d3.HierarchyCircularNode<WritableNode>).data.id)
            .join(
                enter => enter.append("circle"),
                update => update,
                exit => exit.remove()
            )
 
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("r", d => d.r * 0.988)
            .attr("fill", d => d.data.totalPriority === 0 ? d.data.fillColor : `url(#gradient-${d.data.id})`)
            .attr("stroke-width", d => {
                if (d.depth === 0) { // Assuming depth 0 means it's the parent node
                    return 2; // Set the stroke width for the parent separately (example: 2)
                }
                return (d.r * 0.05 + (1 / d.depth) * 0.06) / 2;
            })
            .attr("stroke", d => d.data.totalPriority === 0 ? darkerColor(d.data.fillColor) : '#654ea3')
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
            .attr("filter", d => d.depth === 0 ? "url(#drop-shadow)" : null)
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
                applyZoom(nodes);
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
    const selectedLeafParentId = (selectedNode && (!selectedNode.children || selectedNode.children.length === 0))
        ? selectedNode.parent?.data.id
        : null;

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

    const texts = g.selectAll("text.text-node")
        .data(filteredNodes, d => d.data.id)
        .join(
            enter => {
                const enterTexts = enter.append("text")
                    .attr("class", "text-node font-default font-medium")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .text(d => d.data.name)
                    .on("click", handleCircleClick);

                // Only wrap text if the radius is large enough
                enterTexts.filter(d => d.r > 10)
                    .call(wrap, 13);

                // Reduce text quality for small nodes
                enterTexts.filter(d => d.r <= 10)
                    .attr("class", "text-node font-default font-small");

                return enterTexts;
            },
            update => update,
            exit => exit.remove()
        );

    // Only update and transform visible texts
    texts.filter(d => d.r > 1) // skip nodes that are too small
        .attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r * 0.02})`);

    // Optionally reduce update frequency with requestAnimationFrame
    requestAnimationFrame(() => {
        texts.attr("transform", d => `translate(${d.x},${d.y}) scale(${d.r * 0.02})`);
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
                tspanElements = [];

            // Construct lines from words
            while (word = words.pop()) {
                let prospectiveLine = line.length ? line.join(" ") + " " + word : word;
                if (prospectiveLine.length > width) {
                    tspanElements.push(line.join(" "));
                    line = [word];
                } else {
                    line.push(word);
                }
            }
            if (line.length > 0) {
            tspanElements.push(line.join(" "));
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


    updateDimensions([50])


    svg.on("wheel.zoom dblclick.zoom mousedown.zoom mousemove.zoom mouseup.zoom touchstart.zoom touchmove.zoom touchend.zoom", null);

});


</script>


<div id="circle-packing"></div>



<style>


    :global(.circle) {
        transition: fill 0.3s ease, stroke-width 0.3s ease, stroke 0.3s ease;
    }

    :global(.circle-selected) {
        stroke: rgb(0, 255, 255);
        transition: fill 0.3s ease, stroke-width 0.3s ease;
    }

    #circle-packing {
        width: 100%;
        margin: 0 auto;
        min-width: 150px;
        background: radial-gradient(ellipse at left top, #102441 0%, #0e1525 80%);
        border: 2px solid #c2c5cc; /* Added border with a width of 2px */
    }

    :global(.text-node) {
        fill: #0e1525;       /* Text color */
        user-select: none;
    }

    :global(.hoverable:hover) {
        stroke: rgb(161, 134, 187); /* Change color on hover */
        fill: rgba(255, 255, 255, 0.1); /* Add a translucent fill on hover */
        transition: stroke 0.3s ease, stroke-width 0.3s ease, fill 0.3s ease;
    
    }




</style>