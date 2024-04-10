
  <script lang="ts">
    // The token is accessible as a prop in your Svelte component

    import { onMount } from 'svelte';
    export let data: { refreshToken: string, token: string};

    import Grid from './Grid.svelte'
    import Modal from './modal.svelte'
    import Square from './Square.svelte'

    console.log("tokens");
    
    console.log(data.token);
    console.log(data.refreshToken);

    onMount(() => {
        console.log("tokens");

        console.log(data.token);
        console.log(data.refreshToken);
        
        // Setting tokens to localStorage
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('refresh_token', data.refreshToken);
  });



    
  </script>
     <a data-sveltekit-preload-data="hover" href="/">

         workspace
    </a>

  


    
    <Grid/>
    
    <Modal/>
    
    <Square/>
    
  <!-- Use the token in your HTML template -->

