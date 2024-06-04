<script>
import { Button } from "$lib/components/ui/button";
import * as Drawer from "$lib/components/ui/drawer";

export let addIssueMain;
</script>

<Drawer.Root>
    <Drawer.Trigger>|   +   |</Drawer.Trigger>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
        <Drawer.Description>This action cannot be undone.</Drawer.Description>
      </Drawer.Header>
      <Drawer.Footer>
        
        <Drawer.Close><Button on:click={() => addIssueMain()}>Add Stuff</Button></Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>