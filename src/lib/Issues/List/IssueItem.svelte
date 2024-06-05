<script lang="ts">
    export let issue;
  </script>
  
  <div class="issue-item">
    <h1 class="issue-name">{issue.name}</h1>
    <p class="issue-description">{issue.description}</p>
    <p class="issue-details">
      <span class="issue-detail"><strong>Priority:</strong> {issue.priority}</span>
      <!-- Add more issue details as needed -->
      <span class="issue-detail"><strong>State:</strong> {issue.state}</span>
      <span class="issue-detail"><strong>Assignee:</strong> {issue.assignee}</span>
      <span class="issue-detail"><strong>Cycle:</strong> {issue.cycle}</span>
      <span class="issue-detail"><strong>Tags:</strong> {JSON.stringify(issue.tags)}</span>
    </p>
  </div>
  
  <style>
    .issue-item {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background-color: #f9f9f9;
    }
  
    .issue-name {
      font-size: 1.5em;
      margin-bottom: 8px;
      color: #333;
    }
  
    .issue-description {
      font-size: 1em;
      margin-bottom: 8px;
      color: #666;
    }
  
    .issue-details {
      font-size: 0.9em;
      color: #444;
    }
  
    .issue-detail {
      display: block;
      margin-bottom: 4px;
    }
  
    .issue-detail strong {
      color: #000;
    }
  </style>
  