<script lang="ts">
    import { writable, get } from 'svelte/store';
    import { nodesDataStore } from '../../stores';  // Adjust path as necessary
    import type { Node } from '../../types/collection';
    import { selectedNodeId } from '../../stores';
    import { addNode, updateNodeNameByID, deleteNodeById } from '$lib/supabaseClient';

    interface Feature {
        id: number;
        name: string;
        isHovered: boolean;
        isEditing: boolean;
    }

    function nodeToFeature(node: Node): Feature {
        return {
            id: node.id,
            name: node.name,
            isHovered: false,  // Default to false
            isEditing: false   // Default to false
        };
    }

    let showInputBox = false;

    const features = writable<Feature[]>([]);

    selectedNodeId.subscribe($selectedNodeId => {
        const allNodes: Node[] = get(nodesDataStore);
        
        // Find all nodes with parent_id equal to selected node's ID
        const selectedFeatures = allNodes
            .filter(node => node.parent_id === $selectedNodeId)
            .map(nodeToFeature);

        features.set(selectedFeatures);  // Update the features store
    });

    let newFeatureName = '';
    let newFeatureValue = 0;
    let newFeatureState = '';

    let editingFeatureName = ''; // New variable for edit operation
    let hoveredFeatureIndex: number | null = null;
    let editingFeatureIndex: number | null = null;

    async function addFeature() {
        if (newFeatureName.trim() === '' || newFeatureState.trim() === '' || isNaN(newFeatureValue)) return;

        // Call addNode function and wait for its result
        const result = await addNode(newFeatureName, newFeatureValue, $selectedNodeId, newFeatureState);
        console.log(result);
        
        // Check if the node was successfully added
        if (result.success && result.id !== undefined) {
            // If successful, update the features store with the new node
            features.update(currentFeatures => {
                return [...currentFeatures, { id: result.id, name: newFeatureName, isHovered: false, isEditing: false }];
            });
        }

        // Reset inputs after adding
        newFeatureName = '';
        newFeatureValue = 0;
        newFeatureState = '';
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && editingFeatureIndex === null) {
            addFeature();
        } else if (event.key === 'Backspace' && newFeatureName.trim() === '' && editingFeatureIndex === null) {
            removeLastFeature();
        }
    }

    function removeLastFeature() {
        features.update(currentFeatures => {
            if (currentFeatures.length > 0) {
                const lastFeature = currentFeatures[currentFeatures.length - 1];
                deleteNodeById(lastFeature.id);
                newFeatureName = lastFeature.name;
                return currentFeatures.slice(0, -1);
            }
            return currentFeatures;
        });
    }

    function handleMouseEnter(index: number) {
        features.update(currentFeatures => {
            return currentFeatures.map((feature, i) => {
                if (i === index) {
                    return { ...feature, isHovered: true };
                }
                return feature;
            });
        });
        hoveredFeatureIndex = index;
    }

    function handleMouseLeave(index: number) {
        features.update(currentFeatures => {
            return currentFeatures.map((feature, i) => {
                if (i === index) {
                    return { ...feature, isHovered: false };
                }
                return feature;
            });
        });
        hoveredFeatureIndex = null;
    }

    function deleteFeature(index: number, id: number) {
        if (index !== editingFeatureIndex) {
            console.log(id);
            deleteNodeById(id);
            features.update(currentFeatures => {
                return currentFeatures.filter((_, i) => i !== index);
            });
            hoveredFeatureIndex = null;
        }

        console.log($nodesDataStore);
    }

    function startEditingFeature(index: number) {
        editingFeatureName = $features[index].name; // Use editingFeatureName
        editingFeatureIndex = index;
        features.update(currentFeatures => {
            return currentFeatures.map((feature, i) => {
                if (i === index) {
                    return { ...feature, isEditing: true };
                }
                return { ...feature, isEditing: false };
            });
        });

        setTimeout(() => {
            const editingInput = document.querySelector('.editing-input');
            if (editingInput instanceof HTMLInputElement) {
                editingInput.focus();
            }
        }, 0);
    }

    function saveEditedFeature(index: number, id: number) {
        console.log(id);
        updateNodeNameByID(id, editingFeatureName);
        features.update(currentFeatures => {
            return currentFeatures.map((feature, i) => {
                if (i === index) {
                    return { ...feature, name: editingFeatureName, isEditing: false }; // Use editingFeatureName
                }
                return feature;
            });
        });
        editingFeatureName = ''; // Reset editingFeatureName
        editingFeatureIndex = null;
    }
</script>

  <style>
    .feature-list {
      margin: 20px 0;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
  
    .feature-item:hover {
      background-color: #f5f5f5;
    }
  
    .delete-button, .edit-button {
      visibility: hidden;
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
  
    .delete-button {
      background-color: #dc3545;
    }
  
    .edit-button {
      background-color: #007BFF;
      margin-right: 8px;
    }
  
    .feature-item:hover .delete-button,
    .feature-item:hover .edit-button {
      visibility: visible;
    }
  
    .editing-input {
      padding: 8px;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  
    input[type="text"] {
      padding: 8px;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #007BFF;
      color: white;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #0056b3;
    }



    .feature-container {
        padding: 30px;
                margin-right: 3vw;
        margin-left: 3vw;
        margin-top: 2vw; 
        margin-bottom: 2vw;
        /* padding-top: 600px; */

        background: hsl(227, 36%, 5%, 0.5);
        background-image: radial-gradient(circle at 89% 12%, hsla(223, 45%, 10%, 0.639) 0%, hsla(227, 69%, 3%, 0.64) 122%), url('/noise.svg'); 
            

        border-radius: 24px; 
     
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow:  -10px 10px 24px hsla(223, 33%, 4%, 0.753);
        color: white;
        



    }

    .feature-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 24px; 
        border: 1px solid transparent;
        background: linear-gradient(210deg,hsl(0, 0%, 100%),hsl(222, 12%, 22%)) border-box;
        -webkit-mask:
            linear-gradient(#fff 0 0) padding-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none;  /* Ignore all pointer events */
                
        
    }


    .feature-container .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-container .header h2 {
  margin: 0;
}

.feature-container .header .buttons {
 
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  
}

.feature-container .input-container {
  margin-top: 10px;
}

.feature-container .input-container input {
  padding: 5px;
  margin-right: 5px;
}




    
  </style>


<div class="feature-container">
    <div class="header">
        <h2>Sub Nodes</h2>
        <div class="buttons">
            <button on:click={() => showInputBox = !showInputBox}>{showInputBox ? 'X' : '+'}</button>
            <button on:click={() => showInputBox = !showInputBox}>...</button>
        </div>
   
        
    </div>
    
    {#if showInputBox}
      <div class="input-container">
        <input
          type="text"
          bind:value={newFeatureName}
          placeholder="Enter new feature"
          on:keydown={handleKeydown}
        />
        <button on:click={addFeature}>Add Feature</button>
      </div>
    {/if}
  
    {#if $features.length > 0}
      <ul class="feature-list">
        {#each $features as feature, index (feature.id)}
          <li
            class="feature-item"
            on:mouseenter={() => handleMouseEnter(index)}
            on:mouseleave={() => handleMouseLeave(index)}
          >
            {#if feature.isEditing}
              <input
                type="text"
                class="editing-input"
                bind:value={editingFeatureName}
                on:keydown={(event) => {
                  if (event.key === 'Enter') {
                    saveEditedFeature(index, feature.id);
                  }
                }}
              />
              <button on:click={() => saveEditedFeature(index, feature.id)}>Save</button>
            {:else}
              {feature.name}
              {#if feature.isHovered}
                <button class="edit-button" on:click={() => startEditingFeature(index)}>
                  Edit
                </button>
                <button class="delete-button" on:click={() => deleteFeature(index, feature.id)}>
                  Delete
                </button>
              {/if}
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  