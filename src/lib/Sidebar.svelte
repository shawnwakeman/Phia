<script lang="ts">
    import { Home, BarChart2, AlertCircle, Square, FileText, User, Settings, BookOpen } from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button/index.js";

    let items = [
        { href: "/", icon: Home, text: "Home" },
        { href: "/state", icon: BarChart2, text: "State" },
        { href: "/issues", icon: AlertCircle, text: "Issues" },
        { href: "/blocks", icon: Square, text: "Blocks" },
        { href: "/documents", icon: FileText, text: "Documents" }
    ];

    let bottomItems = [
        { href: "/auth", icon: User, text: "Profile" },
        { href: "/settings", icon: Settings, text: "Project Settings" },
        { href: "/docs", icon: BookOpen, text: "Docs" }
    ];
  </script>
  
  <style>
    .sidebar {
        width: 3.5rem;
        transition: width 0.3s ease-in-out;
        will-change: width; /* Added will-change property */
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 0.5rem;
        overflow: hidden;
        user-select: none;
        z-index: 5;
        flex-shrink: 0; /* Prevents the sidebar from shrinking */
        
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
      transition: all 0.2s ease-in-out;
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
      transition: opacity 0.2s ease-in-out;
      white-space: nowrap;
    }
  
    .sidebar:hover .sidebar-item-text {
      opacity: 1;
    }
  </style>
  
  <div class="sidebar" id="sidebar-div">
    <div>
        <a class="sidebar-item"  href={""} data-sveltekit-preload-data>
            <span class="sidebar-item-icon"> <BarChart2 class="" /></span>
            <span class="sidebar-item-text">{"PHia"}</span>
        </a>
    
    
        <ul>
            {#each items as { href, icon: Icon, text }}
            <li>
                <a class="sidebar-item"  href={href} data-sveltekit-preload-data>
                    <span class="sidebar-item-icon"> <Icon class="" /></span>
                    <span class="sidebar-item-text">{text}</span>
                </a>
            </li>
          {/each}
        </ul>
    </div>
   

    <ul>
        {#each bottomItems as { href, icon: Icon, text }}
          <li>
            <a class="sidebar-item"  href={href} data-sveltekit-preload-data>
              <span class="sidebar-item-icon"> <Icon class="" /></span>
              <span class="sidebar-item-text">{text}</span>
            </a>
          </li>
        {/each}
      </ul>
  </div>
  