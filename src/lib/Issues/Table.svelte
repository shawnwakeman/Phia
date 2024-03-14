<script lang="ts">
    export let rows;
    let columnNames = rows.length > 0 ? Object.keys(rows[0]) : [];
    console.log(rows);
  </script>
  
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
  
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
  
    th {
      background-color: #f2f2f2;
    }
  
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
  
  <table>
    <thead>
      <tr>
        {#each columnNames as columnName}
          <th>{columnName}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each columnNames as columnName}
            <td>{row[columnName]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>