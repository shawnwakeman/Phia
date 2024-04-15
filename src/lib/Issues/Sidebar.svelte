<script>
    let size = 50; // Percentage of the container that the first component will occupy
    let showComponent = 'both'; // Controls which components are shown ('both', 'first', 'second')
</script>

<div class="container">
    {#if showComponent === 'both' || showComponent === 'first'}
        <div class="component" style="width: {size}%;">
            <h2>Component 1</h2>
            <p>Content of Component 1</p>
        </div>
    {/if}

    {#if showComponent === 'both' || showComponent === 'second'}
        <div class="component" style="width: {100 - size}%;">
            <h2>Component 2</h2>
            <p>Content of Component 2</p>
        </div>
    {/if}
</div>

<label for="sizeSlider">Adjust Size: Component 1 - {size}%, Component 2 - {100 - size}%</label>
<input type="range" id="sizeSlider" min="0" max="100" bind:value={size} />

<button on:click={() => showComponent = 'first'}>Show Only Component 1</button>
<button on:click={() => showComponent = 'second'}>Show Only Component 2</button>
<button on:click={() => showComponent = 'both'}>Show Both Components</button>

<style>
    .container {
        display: flex;
        width: 100%;
    }
    .component {
        padding: 1rem;
        background: lightgray;
        transition: width 0.3s ease;
    }
</style>
