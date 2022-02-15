<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Input, Section, Label } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";

  let nodeCount = 0;
  let format = "{f}{.v}";

  onMount(() => {
    parent.postMessage({ pluginMessage: { type: "init" } }, "*");
  });

  window.onmessage = (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;

    if (type === "nodes") {
      nodeCount = message.count;
    } else if (type === "export") {
      exportZip(message.assets);
    }
  };

  const onChangeFormat = () => {
    parent.postMessage({ pluginMessage: { type: "format", format } }, "*");
  };

  const onSelectExport = () => {
    parent.postMessage({ pluginMessage: { type: "export", format } }, "*");
  };

  const onSelectCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  const exportZip = async (assets: Asset[]) => {
    let zip = new JSZip();

    assets.forEach((asset) => {
      let blob = new Blob([asset.data!], { type: "image/png" });
      zip.file(`${asset.filename}.png`, blob, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Export.zip";
    link.click();
  };
</script>

<div class="wrap">
  <Section>Format</Section>
  <Input on:keydown={onChangeFormat} bind:value={format} />

  <div>
    <Label
      >{"{f} = frame name; {p} = variant property; {v} = variant value"}</Label
    >
    <Label>
      {"To include a character only if the value exists, place it inside the braces, e.g. '{-v}'."}
    </Label>
  </div>

  <div class="button-holder">
    <Button variant="secondary" on:click={onSelectCancel}>Cancel</Button>
    <Button on:click={onSelectExport} disabled={nodeCount === 0}
      >Export {nodeCount} images</Button
    >
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding: 4px;
    font-size: small;
  }
  .button-holder {
    display: flex;
    flex: 1;
    flex-direction: row;
    padding: 8px;
    gap: 8px;
  }
</style>
