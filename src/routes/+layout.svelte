<script>
import "../app.pcss";
import { ModeWatcher } from "mode-watcher";
import '@fontsource-variable/inter';

import { invalidate } from '$app/navigation';
import { onMount } from 'svelte';
import { Toaster } from "$lib/components/ui/sonner";
import { setContext } from 'svelte';
import { useSupabaseClient } from '$lib/supabaseClient';
export let data

  let { supabase, session } = data
  $: ({ supabase, session } = data)
  
  
  setContext('supabaseClient', supabase);

  useSupabaseClient()

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
<Toaster />
  
  <slot></slot>
  
<style>
    :global(body) {
        font-family: 'Inter Variable', sans-serif;
    }   

    
</style>

