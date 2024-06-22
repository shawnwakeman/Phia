<script lang="ts">
    import { writable, get } from 'svelte/store';
    import { nodesDataStore, selectedNodeId } from '../../stores';
    import type { Node } from '../../types/collection';
    import imgas from '$lib/images/test.png';
</script>

<style>
    .feature-container {
        position: relative;
        padding: 30px;
    
        margin-right: 3vw;
        margin-left: 3vw;
        margin-top: 2vw; 
        margin-bottom: 2vw;
        background: hsl(227, 36%, 5%, 0.5);
        background-image: radial-gradient(circle at 89% 12%, hsla(223, 45%, 10%, 0.639) 0%, hsla(227, 69%, 3%, 0.64) 122%), url('/noise.svg'); 
        border-radius: 24px; 
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow: -10px 10px 24px hsla(223, 33%, 4%, 0.753);
        color: white;
      
    }

    .feature-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 24px; 
        border: 1px solid transparent;
        background: linear-gradient(210deg, hsl(0, 0%, 100%), hsl(222, 12%, 22%)) border-box;
        -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none; /* Ignore all pointer events */
    }

    .divider {
        width: 100%;
        height: 1px;
        margin: 20px 0;
        background-color: hsla(0, 0%, 100%, 0.3);
    }

    .image-container {
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */

    }

    img {
        max-width: 100%;
        height: 300px;
        border-radius: 12px; /* Rounded borders */
    }
</style>

<div class="feature-container">
    <h1>Design Document</h1>
    <div class="divider"></div>
    <div class="image-container">
        <img src="{imgas}" alt="Design Image"/>
    </div>
</div>
