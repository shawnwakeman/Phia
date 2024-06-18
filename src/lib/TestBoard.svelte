<script lang="ts">
    import { onMount } from 'svelte';
    import type { Node, Issue } from "../types/collection"
    import * as d3 from 'd3';
    import { selectedNodeStore } from "../stores";
    import { selectedNodeId, nodesDataStore, navigateNodeStore, issuesDataStore, sidebarWidthStore } from "../stores";
    import { get } from 'svelte/store';
    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    import { canJoin } from '@tiptap/pm/transform';



        
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

    let canvas: HTMLCanvasElement;
    let data: WritableNode | null;
    let nodes: d3.HierarchyCircularNode<WritableNode>; 
    let width = 400;
    let height = 400




    onMount(() => {
        canvas  = d3.select("#circle-packing").append("canvas")
            .attr("id", "canvas")
            .attr("width", 400)
            .attr("height", 400);

        let context = canvas.node().getContext("2d");
        
        let data = createHierarchy($nodesDataStore)


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
        



        drawCircles(nodes)


        
        function drawCircles(node) {
            node.each(d => {
                console.log(d);
                
                context.fillStyle = d.data.fillColor
                context.beginPath();
                context.arc(d.x, d.y, d.r, 0,  2 * Math.PI, true);
                context.fill();
                context.closePath();
                context.stroke();
            })
        }

        function drawAll() {

            let width = 400;
            let height = 400

            let centerX = width/2
			let	centerY = height/2;


            let canvas = d3.select("#circle-packing").append("canvas")
            .attr("id", "canvas")
            .attr("width", 400)
            .attr("height", 400);

            let context = canvas.node().getContext("2d");
				context.clearRect(0, 0, width, height);

            let hiddenCanvas  = d3.select("#circle-packing").append("canvas")
				.attr("id", "hiddenCanvas")
				.attr("width", width)
				.attr("height", height)
				.style("display","none");

            let hiddenContext = hiddenCanvas.node().getContext("2d");
                hiddenContext.clearRect(0, 0, width, height);

            let detachedContainer = document.createElement("custom");
            let dataContainer = d3.select(detachedContainer);


            var colorCircle = d3.scaleOrdinal([0,1,2,3], ['#bfbfbf','#838383','#4c4c4c','#1c1c1c']);
			

            let diameter = Math.min(width*0.9, height*0.9),
				radius = diameter / 2;
				
            let zoomInfo = {
				centerX: width / 2,
				centerY: height / 2,
				scale: 1
			};

            let colToCircle = {};

			var cWidth = canvas.attr("width");
			var cHeight = canvas.attr("height");

            var nodeCount = nodes.length;


            function drawCanvas(chosenContext, hidden) {

                chosenContext.fillStyle = "#fff";
				chosenContext.rect(0,0,cWidth,cHeight);
				chosenContext.fill();

                drawCircles(nodes)

            }





        }
      
    });

</script>




<div id="circle-packing"></div>


<style>


    

    #circle-packing {
        width: 100%;
        margin: 0 auto;
        min-width: 150px;
        background: radial-gradient(ellipse at left top, #102441 0%, #0e1525 80%);
        border: 2px solid #c2c5cc; /* Added border with a width of 2px */
    }






</style>