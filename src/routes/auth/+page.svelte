<script lang="ts">
    export let form
  </script>
  

  <form method="POST" action="?/oauthGithub">
    <button style="margin-top: 12px;" name="provider" value="github">Login with GitHub</button>
  </form>

  <form method="POST" action="?/oauthGoogle">
    <button style="margin-top: 12px;" name="provider" value="google">Login with Google</button>
  </form>
  
