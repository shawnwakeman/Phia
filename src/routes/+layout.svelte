<script>
import "../app.pcss";
import { ModeWatcher } from "mode-watcher";
import '@fontsource-variable/inter';

import { invalidate } from '$app/navigation';
import { onMount } from 'svelte';

export let data

  let { supabase, session } = data
  $: ({ supabase, session } = data)

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    return () => subscription.unsubscribe()
  })
</script>

<ModeWatcher />

  
  <slot></slot>
  
<style>
    :global(body) {
        font-family: 'Inter Variable', sans-serif;
    }   
</style>

