<script lang="ts">
    let items = [
        { href: "/", icon: "🏠", text: "asd" },
      { href: "/home", icon: "🏠", text: "Home" },
      { href: "/state", icon: "📊", text: "State" },
      { href: "/issues", icon: "❗", text: "Issues" },
      { href: "/blocks", icon: "🔲", text: "Blocks" },
      { href: "/documents", icon: "📄", text: "Documents" }
    ];


    let bottomItems = [
        { href: "/profile", icon: "👤", text: "Profile" },
        { href: "/settings", icon: "⚙️", text: "Project Settings" },
        { href: "/docs", icon: "📖", text: "Docs" }
    ];
  </script>
  
  <style>
    .sidebar {
      width: 3.5rem;
      height: 100vh;
      background-color: #1f2937;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.5rem;
      overflow-y: auto;
      overflow-x: hidden; /* Hide horizontal scrollbar */
      user-select: none;  /* user */
     
    }
  
    .sidebar:hover {
      width: 13rem;
  
    }
  
    .sidebar-item {
      color: #9ca3af;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
  
    .sidebar-item:hover {
      background-color: #374151;
      color: #ffffff;
    }
  
    .sidebar-item-icon {
      font-size: 1.25rem;
      margin-right: 0.75rem;
    }
  
    .sidebar-item-text {
      opacity: 0;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
  
    .sidebar:hover .sidebar-item-text {
      opacity: 1;
    }
  </style>
  
  <div class="sidebar" id="sidebar-div">
    <ul>
      {#each items as item}
        <li>
          <a class="sidebar-item" href={item.href}>
            <span class="sidebar-item-icon">{item.icon}</span>
            <span class="sidebar-item-text">{item.text}</span>
          </a>
        </li>
      {/each}
    </ul>

    <ul>
        {#each bottomItems as item}
          <li>
            <a class="sidebar-item" href={item.href}>
              <span class="sidebar-item-icon">{item.icon}</span>
              <span class="sidebar-item-text">{item.text}</span>
            </a>
          </li>
        {/each}
      </ul>
  </div>
  