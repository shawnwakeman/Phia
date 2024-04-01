<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
  
    type $$Props = NodeProps;
    export let data: $$Props['data'];
  </script>
  
  <style>

  </style>
  
  <div class="triangle">
    <div>
      {data.emoji}
    </div>
    <div>
      <div>{data.name}</div>
      <div>{data.job}</div>
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
  