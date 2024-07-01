<script>
    import { onMount } from 'svelte';
    import { all, createLowlight } from 'lowlight';

    const lowlight = createLowlight(all);
  
    export let language = 'javascript';
    export let code = '';
  
    let codeElement;
  
    function copyCode() {
 
      alert('Code copied to clipboard');
    }
  
    onMount(() => {
      if (codeElement) {
        const highlighted = lowlight.highlight(language, code);
        codeElement.innerHTML = highlighted.value;
      }
    });
  </script>
  
  <style>
    .code-block-header {
      display: flex;
      justify-content: space-between;
      background-color: #f3f4f6;
      padding: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .code-block {
      position: relative;
      border-radius: 0.25rem;
      background-color: #f3f4f6;
      padding: 1rem;
      font-family: 'Roboto Mono', monospace;
    }
    .copy-button {
      cursor: pointer;
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
  </style>
  
  <div class="code-block-header">
    <select bind:value="{language}">
      <option value="javascript">JavaScript</option>
      <option value="typescript">TypeScript</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <!-- Add more languages as needed -->
    </select>
    <button class="copy-button" on:click="{copyCode}">Copy</button>
  </div>
  <div class="code-block" bind:this="{codeElement}"></div>
  