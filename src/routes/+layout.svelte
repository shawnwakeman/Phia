<script>
import "../app.pcss";
import { ModeWatcher } from "mode-watcher";
import '@fontsource-variable/inter';
</script>

<ModeWatcher />
<slot />


<style>
    :global(body) {
    font-family: 'Inter Variable', sans-serif;
    }
  </style>
