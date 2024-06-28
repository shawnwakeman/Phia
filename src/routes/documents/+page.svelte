<script>
    import { supabase } from '$lib/supabaseClient';
  
    let file;
  
    async function uploadFile() {
      if (file) {
        const { data, error } = await supabase.storage
          .from('images_for_editor')
          .upload(`project_1/${file.name}`, file);
  
        if (error) {
          console.error('Error uploading file:', error);
        } else {
          console.log('File uploaded:', data);
        }
      }
    }
  
    async function getFileUrl() {
    if (file) {
      const filePath = `project_1/${file.name}`;
      console.log('Generating public URL for file at path:', filePath);

      const { data, error } = supabase
        .storage
        .from('images_for_editor')
        .getPublicUrl(filePath);

      if (error) {
        console.error('Error generating public URL:', error);
      } else {
        const publicURL = data.publicUrl;
        console.log('Public URL:', publicURL);

        // Display the image
        const imgElement = document.createElement('img');
        imgElement.src = publicURL;
        document.body.appendChild(imgElement);
      }
    }
  }
  </script>
  
  <style>
    .upload-container {
      margin: 20px;
    }
  
    .upload-button {
      margin-top: 10px;
    }
  </style>
  
  <div class="upload-container">
    <input type="file" on:change={(e) => file = e.target.files[0]} />
    <button class="upload-button" on:click={uploadFile}>Upload File</button>
    <button class="upload-button" on:click={getFileUrl}>Get File</button>
  </div>
  