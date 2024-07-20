<script>
    import { anyify } from "../../../utils.js";
    import Moveable from "svelte-moveable";
    import { sidebarWidthStore } from '$lib/stores'
    
    export let editor;
    
    let key = 0;
    
    const updateMediaSize = () => {
      const imageInfo = document.querySelector(".ProseMirror-selectednode");
      if (imageInfo) {
        const selection = editor.state.selection;
        editor.commands.setImage({
          src: imageInfo.src,
          width: Number(imageInfo.style.width.replace("px", "")),
          height: Number(imageInfo.style.height.replace("px", ""))
        });
        editor.commands.setNodeSelection(selection.from);
      }
    };
    
    const updateTarget = () => {
      const { selection } = editor.state;
      const node = selection.$anchor.parent;
      console.log("asd");
      
    return anyify(editor.view.nodeDOM(selection.$anchor.pos));
      
   
    };
    
    const updateMoveable = () => {
        key++;
    };
    
    editor.on('update', updateMoveable);
    editor.on('selectionUpdate', updateMoveable);
    
    editor.view.dom.addEventListener('click', updateMoveable);
    window.addEventListener('resize', updateMoveable);
    
    sidebarWidthStore.subscribe(updateMoveable);
</script>
  
  <style>

  </style>
  
  {#key key}
    <Moveable
      target={updateTarget()}
      container={null}
      origin={false}
      edge={false}
      throttleDrag={0}
      keepRatio={true}
      resizable={true}
      throttleResize={0}
      on:resize={({
        detail: {
          target,
          width,
          height,
          // dist,
          delta
        }
      }) => {
        delta[0] && (target.style.width = `${width}px`);
        delta[1] && (target.style.height = `${height}px`);
      }}
      on:resizeEnd={() => {
        updateMediaSize();
        key++;
      }}
      scalable={true}
      throttleScale={0}
      renderDirections={['w', 'e']}
      on:scale={({
        detail: {
          target,
          // scale,
          // dist,
          // delta,
          transform
        }
      }) => {
        target.style.transform = transform;
      }}

    />
  {/key}
