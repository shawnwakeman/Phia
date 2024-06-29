<!-- ImageWrapper.svelte -->
<script>
    export let src;
    export let alt;
    export let title;
    export let width;
    export let height;
    export let updateAttributes;
  
    function handleLoad(event) {
      if (!width || !height) {
        const { naturalWidth, naturalHeight } = event.target;
        updateAttributes({
          width: width || naturalWidth,
          height: height || naturalHeight,
        });
      }
    }
  </script>
  
  <div style="display: inline-block; max-width: 100%;">
    <img
      src={src}
      alt={alt}
      title={title}
      style="width: {width || 'auto'}; height: {height || 'auto'}"
      on:load={handleLoad}
    />
  </div>
  