<script lang="ts">
    export let form
  </script>
  

  <form method="POST" action="?/oauth">
    <button style="margin-top: 12px;" name="provider" value="github">Login with GitHub</button>
  </form>
  
  
  {#if form?.message}
    <p>{form.message}</p>
  {/if}
  {#if form?.error}
    <p style="color: red;">{form.error}</p>
  {/if}
  {#if form?.verify}
    <form method="POST" action="?/verify_otp">
      <input name="otp" placeholder={`OTP sent to ${form?.phone}`} type="text">
      <input name="phone" type="hidden" value={form?.phone}>
      <button style="margin-top: 12px;">Verify</button>
    </form>
  {/if}