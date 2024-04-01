<script lang="ts">
    import { writable } from 'svelte/store';
    import {
      SvelteFlow,
      Controls,
      Background,
      BackgroundVariant,
      MiniMap,
      useSvelteFlow,
      type Node,
      type Edge
    } from '@xyflow/svelte';
 
   
    import Square from './Square.svelte';
    import Sidebar from './SideBarNB.svelte';
    import '@xyflow/svelte/dist/style.css';

    import { initialEdges, initialNodes } from './nodesAndEdges';
  
    const nodes = writable<Node[]>(initialNodes);
  
    const edges = writable<Edge[]>(initialEdges);

    const nodeTypes = {
        custom: Square
    };
  
    const { screenToFlowPosition } = useSvelteFlow();
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
  
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    };
  
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
  
      if (!event.dataTransfer) {
        return null;
      }
  
      const type = event.dataTransfer.getData('application/svelteflow');
  
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
  
      const newNode = {
        id: `${Math.random()}`,
        type,
        position,
        data: { label: `${type} node` },
        origin: [0.5, 0.0]
      } satisfies Node;
  
      $nodes.push(newNode);
      $nodes = $nodes;
    };
  </script>
  
  <main>
    <SvelteFlow {nodes} {edges} fitView on:dragover={onDragOver} on:drop={onDrop}>
      <Controls />
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap />
    </SvelteFlow>
    <Sidebar/>
  </main>
  
  <style>
    main {
      height: 100vh;
      display: flex;
      flex-direction: column-reverse;
    }
  </style>