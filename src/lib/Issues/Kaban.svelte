<script lang="ts">
    // Sample data for the Kanban board
    
    import type { Issue } from "../../types/collection";
    import { selectedNodeStore, issuesDataStore } from "../../stores";
    import { fetchNestedIssues } from "../supabaseClient";



    interface CategorizedIssues {
        [key: string]: Issue[];
    }

    let issues: Issue[] = [];

    let issuesDataStoreLength = 0


    $: if ($selectedNodeStore && $issuesDataStore) {

            
        if ($issuesDataStore.length - issuesDataStoreLength != 0) {
            fetchNestedIssues($selectedNodeStore.id).then(fetchedIssues => {
            issues = fetchedIssues;
            // Update columnNames based on the keys of the first issue, if not already set

            console.log("Issues updated");
            issuesDataStoreLength = $issuesDataStore.length
        }).catch(error => console.error("Failed to fetch nested issues:", error));
        }
    
            
        

    }




    let categorizedIssues: CategorizedIssues = {};


    $: categorizedIssues = categorizeIssues(issues);

    let entries: [string, Issue[]][] = [];

    $: entries = Object.entries(categorizedIssues) as [string, Issue[]][];

    function categorizeIssues(issues: Issue[]): CategorizedIssues {
        return issues.reduce<CategorizedIssues>((acc, issue) => {
        const state = issue.state || 'undefined';
        if (!acc[state]) {
            acc[state] = [];
        }
        acc[state].push(issue);
        return acc;
        }, {});
    }
</script>
  
<style>
    .kanban-board {
      display: flex;
      gap: 20px;
      margin: 20px;
    }
    
    .column {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
    }
  
    .column-header {
      padding: 10px 0;
      text-align: center;
      font-weight: bold;
    }
  
    .task {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 10px;
      background-color: #f9f9f9;
    }
  </style>
  
  <div class="kanban-board">
    {#each Object.entries(categorizedIssues) as [state, tasks]}
      <div class="column">
        <div class="column-header">{state}</div>
        {#each tasks as task (task.id)}
          <div class="task">
            <div><strong>{task.name}</strong></div>
            <div>{task.description}</div>
            <!-- You can add more issue details here -->
          </div>
        {/each}
      </div>
    {/each}
  </div>