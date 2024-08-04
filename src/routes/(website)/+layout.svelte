<script lang="ts">
    export let data

  let { supabase, session } = data
  $: ({ supabase, session } = data)

</script>


<nav style="border: solid; border-width: 0 0 2px; padding-bottom: 5px;">
    <a href="/">Home</a>
    {#if session}
      <a href="/app">App</a>
      <a href="/profile">Self</a>
      <img style="width: 32px; height: 32px; border-radius: 9999px;" src={session.user.user_metadata.avatar_url ?? 'https://api.dicebear.com/8.x/fun-emoji/svg'} alt="person_avatar">
      <form method="POST" action="auth?/signout">
        <button>Logout</button>
      </form>
    {:else}
      <a href='/auth'>Login</a>
    {/if}
  </nav>
  
<slot></slot>