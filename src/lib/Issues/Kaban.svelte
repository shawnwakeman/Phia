<script>
    // Sample data for the Kanban board
    let tasks = {
      todo: [
        { id: 1, title: 'Task 1', description: 'Description for Task 1' },
        { id: 2, title: 'Task 2', description: 'Description for Task 2' },
      ],
      inProgress: [
        { id: 3, title: 'Task 3', description: 'Description for Task 3' },
      ],
      done: [
        { id: 4, title: 'Task 4', description: 'Description for Task 4' },
        { id: 5, title: 'Task 5', description: 'Description for Task 5' },
      ],
    };
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
  