<script lang="ts">
import { onMount } from "svelte";
import { selectedNodeStore } from "../../stores";
import { fetchNestedIssues } from "../supabaseClient";

import CollapsibleSection from './CollapsibleSection.svelte'
import type { Issue, Node } from "../../types/collection";
import IssueList from "./IssueList.svelte"

    let issues: Issue[] = [];
    let currentSelectedNode: Node | null = null;

    $: if (currentSelectedNode) {
        fetchNestedIssues(currentSelectedNode.id).then(fetchedIssues => {
            issues = fetchedIssues;
        });
    } else {
        issues = []; // Reset issues if no node is selected
    }

    // Subscribe to the selectedNodeStore
    selectedNodeStore.subscribe(value => {
        currentSelectedNode = value;     
    });

</script>


<section>
    <CollapsibleSection headerText={'Collapse or Expand me'} >
        <div class="content">
                <IssueList issues = {issues}/>
        </div>
    </CollapsibleSection>
        
    <CollapsibleSection headerText={'Collapse or Expand me'} >
        Look at all this fun content
    </CollapsibleSection>
</section>