<script lang="ts">
    import { writable, get } from 'svelte/store';
    import { nodesDataStore, selectedNodeId } from '../../stores';
    import type { Node } from '../../types/collection';
    import imgas from '$lib/images/test.png';
</script>

<style>

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
