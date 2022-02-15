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

  let format = "{f}{v}";
  let connector = ".";
  let casingOption = undefined;

  let nodeCount = 0;
  let example = ["Select at least one frame."];

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

    if (type === "refresh") {
      nodeCount = message.nodeCount;
      example = message.example;
    } else if (type === "export") {
      exportZip(message.assets);
    }
  };

  const onChangeConfig = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "config",
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
    on:keydown={onChangeConfig}
    bind:value={format}
  />
  <Label>{"{f} = frame name; {v} = variant value"}</Label>

  <Section>Connector</Section>
  <Input
    placeholder="Enter a character"
    on:keydown={onChangeConfig}
    bind:value={connector}
  />
  <Label>{"Each tag above will be joined by this character."}</Label>

  <Section>Capitalization</Section>
  <SelectMenu bind:menuItems={casingOptions} bind:value={casingOption} />

  <Section>Example output</Section>
  <div class="example">
    {#each example as item}
      <div>{item}</div>
    {/each}
  </div>

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
    margin-top: 8px;
  }
  .example {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 8px;
    border-radius: 4px;
    font-size: smaller;
    background-color: rgb(235, 235, 235);
  }
</style>
