<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Section, Label, SelectMenu } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";
  import type { Asset, AssetInfo, Casing, Config } from "./types";

  interface CasingOption {
    value: Casing;
    label: string;
    group: string | null;
    selected: boolean;
  }

  const extension = "png";

  let format = "{f}{v}";
  let connector = ".";
  let casingOption = undefined;

  let nodeCount = 0;
  let exampleAssets: AssetInfo[] = [];

  let casingOptions: CasingOption[] = [
    { value: "lower", label: "Lower", group: null, selected: true },
    { value: "upper", label: "Upper", group: null, selected: false },
    { value: "title", label: "Title", group: null, selected: false },
  ];

  const buildConfig = (): Config => {
    return {
      format,
      connector,
      casing: casingOption.value,
    };
  };

  window.onmessage = (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;

    if (type === "refresh") {
      nodeCount = message.nodeCount;
      exampleAssets = message.exampleAssets;
    } else if (type === "export") {
      exportZip(message.assets);
    }
  };

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "init",
          config: buildConfig(),
        },
      },
      "*"
    );
  });

  const onChangeConfig = (e) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "config",
          config: buildConfig(),
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
          config: buildConfig(),
        },
      },
      "*"
    );
  };

  const exportZip = async (assets: Asset[]) => {
    let zip = new JSZip();

    assets.forEach((asset) => {
      let blob = new Blob([asset.data!], { type: `image/${extension}` });
      zip.file(`${asset.filename}.${extension}`, blob, { base64: true });
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
  <input
    type="text"
    placeholder="Enter a format"
    bind:value={format}
    on:change={onChangeConfig}
  />
  <Label>{"{f} = frame name; {v} = variant value"}</Label>

  <Section>Connector</Section>
  <input
    type="text"
    placeholder="Enter a connector mark"
    bind:value={connector}
    on:input={onChangeConfig}
  />
  <Label>{"Each tag above will be joined by this mark."}</Label>

  <Section>Capitalization</Section>
  <SelectMenu
    bind:menuItems={casingOptions}
    bind:value={casingOption}
    on:change={onChangeConfig}
  />

  <Section>Output</Section>
  <div class="example">
    {#if exampleAssets.length > 0}
      {#each exampleAssets as exampleItem, index}
        {#if index > 0}
          <hr />
        {/if}
        <div class="example-row">
          <div>
            {exampleItem.filename}.{extension}
          </div>
          <div>
            {exampleItem.size.width}x{exampleItem.size.height}
          </div>
        </div>
      {/each}
    {:else}
      <div class="example-text-placeholder">Select at least one frame.</div>
    {/if}
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
    flex-direction: column;
    overflow-y: scroll;
    height: 116px;
    padding: 8px;
    font-size: smaller;
    border-color: rgb(235, 235, 235);
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
  }
  .example-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .example-text-placeholder {
    color: rgb(138, 138, 138);
  }
  input {
    font-size: smaller;
    height: 32px;
    padding: 8px;
    border-color: rgb(235, 235, 235);
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
  }
  input:hover {
    border-color: rgb(219, 219, 219);
  }
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  hr {
    width: 100%;
    border-top: rgb(235, 235, 235);
    border-width: 1px;
  }
</style>
