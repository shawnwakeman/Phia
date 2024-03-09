<script lang="ts">
    import type { Issue } from "../../types/collection";
    export let issues: Issue[];

    let expandedIssueId: number | null = null;

    function toggleExpand(issueId: number) {
        expandedIssueId = expandedIssueId === issueId ? null : issueId;
    }
</script>

<style>
    .issue-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
    }

    button.issue-item {
        all: unset;
        display: block;
 
        border: 1px solid #eee;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        
        text-align: left;
        background: white;
        overflow: hidden;
    }

    .content {
        transform-origin: top;
        transform: scaleY(0);
        transition: transform 0.3s ease-out;
        height: 0; /* Initially, there's no height */
        opacity: 0; /* Make the content fully transparent */
    }

    .expanded .content {
        transform: scaleY(1);
        height: auto; /* Allow the content to expand */
        opacity: 1; /* Make the content fully visible */
        /* No fixed max-height necessary, adapt to content */
    }
</style>

<div class="issue-grid">
    {#each issues as issue}
        <button class="issue-item {expandedIssueId === issue.id ? 'expanded' : ''}" 
                on:click={() => toggleExpand(issue.id)}>
            <strong>{issue.title}</strong> - {issue.state}
            <div class="content">
                <p>{issue.description}</p>
                <!-- Additional content -->
            </div>
        </button>
    {/each}
</div>
