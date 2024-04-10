<script lang="ts">
    let url: string = ''; // This variable will hold the user's input
  </script>
  
  <!-- A simple input field for the user to paste the link -->
  <input type="text" bind:value={url} placeholder="Paste the link here" />
  
  <!-- Conditional rendering to display the iFrame only when there's a URL -->
  {#if url}
    <iframe src={url} width="100%" height="500px" frameborder="0" allowfullscreen></iframe>
  {/if}
  