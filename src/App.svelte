<script>
  import { Button } from "figma-plugin-ds-svelte";
  import { onMount } from "svelte";

  const onSelectExport = () => {
    parent.postMessage({ pluginMessage: { type: "export" } }, "*");
  };

  const onSelectCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "init" } }, "*");
  });
</script>

<div class="wrapper p-xxsmall">
  <div class="flex p-xxsmall mb-xsmall">
    <Button on:click={onSelectCancel} variant="secondary" class="mr-xsmall"
      >Cancel</Button
    >
    <Button on:click={onSelectExport}>Export</Button>
  </div>
</div>

<style>
</style>
