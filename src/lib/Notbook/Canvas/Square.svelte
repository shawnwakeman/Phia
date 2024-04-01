<script lang="ts">
    import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/svelte';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    type $$Props = NodeProps;
    export let data: $$Props['data'];

    import { useEdges, useNodes } from '@xyflow/svelte';

    export let onClick: () => void;
    export let id: string;
   

    const nodes = useNodes();
    const edges = useEdges();

    function duplicateNode() {
    const node = $nodes.find((node) => node.id === id);
    if (node) {
        $nodes.push({
        ...node,
        // You should use a better id than this in production
        id: `${id}-copy${Math.random()}`,
        position: {
            x: node.position.x,
            y: node.position.y + 50
        }
        });
    }
    $nodes = $nodes;
    }

    function deleteNode() {
    $nodes = $nodes.filter((node) => node.id !== id);
    $edges = $edges.filter((edge) => edge.source !== id && edge.target !== id);
    }
  </script>

<ContextMenu.Root>
    <ContextMenu.Trigger>

        
        <div class="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
            <div class="flex">
              <div class="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
                {data.emoji}
              </div>
              <div class="ml-2">
                <div class="text-lg font-bold">{data.name}</div>
                <div class="text-gray-500">{data.job}</div>
              </div>
            </div>
            <Handle
              type="target"
              position={Position.Top}
              class="w-16 !bg-teal-500 rounded-none border-none"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              class="w-16 !bg-teal-500 rounded-none border-none"
            />
          </div>
          



    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item><button on:click={duplicateNode}>duplicate</button></ContextMenu.Item>
      <ContextMenu.Item><button on:click={deleteNode}>delete</button></ContextMenu.Item>
      <ContextMenu.Item>Team</ContextMenu.Item>
      <ContextMenu.Item>Subscription</ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
  
