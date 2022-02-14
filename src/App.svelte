<script lang="ts">
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";
  import { onMount } from "svelte";
  import Button from "./Button.svelte";

  let nodeCount = 0;

  const onSelectExport = () => {
    parent.postMessage({ pluginMessage: { type: "export" } }, "*");
  };

  const onSelectCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  const exportZip = (assets: Asset[]) => {
    let zip = new JSZip();

    console.log("assets:", assets);

    assets.forEach((asset) => {
      // const cleanBytes = typedArrayToBuffer(bytes);
      let blob = new Blob([asset.data!], { type: "image/png" });
      zip.file(`${asset.filename}.png`, blob, {
        base64: true,
      });
    });

    zip.generateAsync({ type: "blob" }).then((content: Blob) => {
      const blobURL = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `Export.zip`;
      link.click();
    });
  };

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
</script>

<div>
  <div>{nodeCount} frames selected</div>
  <input type="text" />
  <div>
    <Button onClick={onSelectCancel}>Cancel</Button>
    <Button onClick={onSelectExport} disabled={nodeCount === 0}>Export</Button>
  </div>
</div>

<style>
</style>
