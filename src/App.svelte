<script>
  import { Button } from "figma-plugin-ds-svelte";
  import { onMount } from "svelte";

  let nodeCount = 0;

  const onSelectExport = () => {
    parent.postMessage({ pluginMessage: { type: "export" } }, "*");
  };

  const onSelectCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "init" } }, "*");
  });

  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    const type = message.type;

    if (type === "nodes") {
      nodeCount = message.count;
    }
  };
</script>

<div class="wrapper p-xxsmall">
  <div class="flex flex-col p-xxsmall mb-xsmall">
    <div>{nodeCount} frames selected</div>
    <Button on:click={onSelectCancel} variant="secondary" class="mr-xsmall"
      >Cancel</Button
    >
    <Button on:click={onSelectExport}>Export</Button>
  </div>
</div>

<style>
</style>
