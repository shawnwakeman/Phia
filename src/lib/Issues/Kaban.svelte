<script lang="ts">
    // Sample data for the Kanban board

    export let rows;
    let tasks = rows.reduce((acc, row) => {
  // Assuming 'state' values are exactly 'todo', 'inProgress', and 'done'
  // Normalize the state to match the keys in the 'tasks' object if needed
    const stateKey = row.state; // Adjust if your state values need normalization

    // Initialize the array if this is the first task in this state
    if (!acc[stateKey]) {
        acc[stateKey] = [];
    }

    // Add the task to the correct state
    acc[stateKey].push(row);

    return acc;
    }, {});
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
    {#each Object.entries(tasks) as [column, tasks]}
      <div class="column">
        <div class="column-header">{column}</div>
        {#each tasks as task}
          <div class="task">
            <div><strong>{task.title}</strong></div>
            <div>{task.description}</div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
  