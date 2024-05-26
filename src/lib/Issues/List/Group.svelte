<script>
    export let groupKey;
    export let groupedIssues;
    import IssueItem from "./IssueItem.svelte";
  </script>
  
  <h1>{groupKey}</h1>
  {#each groupedIssues[groupKey] as issue}
    <IssueItem {issue} />
  {/each}
  
  <style>
    /* Add your styles here */
  </style>
  