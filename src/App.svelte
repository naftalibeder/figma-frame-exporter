<script lang="ts">
  import { onMount } from "svelte";
  import {
    Button,
    Input,
    Section,
    Label,
    SelectMenu,
  } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";

  let nodeCount = 0;
  let format = "{f}{v}";
  let connector = ".";
  let casingOption = undefined;

  let casingOptions = [
    { value: "lower", label: "Lower", group: null, selected: true },
    { value: "upper", label: "Upper", group: null, selected: false },
    { value: "title", label: "Title", group: null, selected: false },
  ];

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
    parent.postMessage(
      {
        pluginMessage: {
          type: "format",
          format,
          connector,
          casing: casingOption.value,
        },
      },
      "*"
    );
  };

  const onChangeConnector = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "format",
          format,
          connector,
          casing: casingOption.value,
        },
      },
      "*"
    );
  };

  const onSelectExport = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "export",
          format,
          connector,
          casing: casingOption.value,
        },
      },
      "*"
    );
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
  <Section>Filename</Section>
  <Input
    placeholder="Enter a format"
    on:keydown={onChangeFormat}
    bind:value={format}
  />
  <Label>{"{f} = frame name; {v} = variant value"}</Label>

  <Section>Connector</Section>
  <Input
    placeholder="Enter a character"
    on:keydown={onChangeConnector}
    bind:value={connector}
  />
  <Label>{"Each tag above will be joined by this character."}</Label>

  <Section>Capitalization</Section>
  <SelectMenu bind:menuItems={casingOptions} bind:value={casingOption} />

  <div class="button-holder">
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
    padding: 8px;
    font-size: small;
  }
  .button-holder {
    padding: 8px;
  }
</style>
