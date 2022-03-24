<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Section, SelectMenu } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";
  import type { Asset, AssetInfo, Casing, Config, Extension } from "./types";
  import { displaySize } from "./utils.js";

  interface CasingOption {
    value: Casing;
    label: string;
    group: string | null;
    selected: boolean;
  }

  interface ExtensionOption {
    value: Extension;
    label: string;
    group: string | null;
    selected: boolean;
  }

  let casingOptions: CasingOption[] = [
    { value: "lower", label: "Lower", group: null, selected: true },
    { value: "upper", label: "Upper", group: null, selected: false },
    { value: "title", label: "Title", group: null, selected: false },
  ];

  let extensionOptions: ExtensionOption[] = [
    { value: "PNG", label: "PNG", group: null, selected: true },
    { value: "JPG", label: "JPG", group: null, selected: false },
    { value: "SVG", label: "SVG", group: null, selected: false },
  ];

  let syntax = "{frame}.{variant}";
  let connector = ".";
  let casingOption = casingOptions[0];
  let sizeConstraint = "2x";
  let extensionOption = extensionOptions[0];

  let nodeCount = 0;
  let exampleAssets: AssetInfo[] = [];

  const buildConfig = (): Config => {
    return {
      syntax,
      connector,
      casing: casingOption.value,
      sizeConstraint,
      extension: extensionOption.value,
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
      const extensionLower = asset.extension.toLowerCase();
      let blob = new Blob([asset.data!], { type: `image/${extensionLower}` });
      zip.file(`${asset.filename}.${extensionLower}`, blob, { base64: true });
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
  <div class="row">
    <div class="section">
      <Section>Filename</Section>
      <input
        type="text"
        placeholder="Enter a syntax"
        bind:value={syntax}
        on:input={onChangeConfig}
      />
    </div>
  </div>

  <div class="row">
    <div class="section">
      <Section>Variant connector</Section>
      <input
        type="text"
        placeholder="Enter a connector mark"
        bind:value={connector}
        on:input={onChangeConfig}
      />
    </div>
    <div class="section">
      <Section>Capitalization</Section>
      <SelectMenu
        bind:menuItems={casingOptions}
        bind:value={casingOption}
        on:change={onChangeConfig}
      />
    </div>
  </div>

  <div class="row">
    <div class="section">
      <Section>Size</Section>
      <input
        type="text"
        placeholder="E.g. 2x, 64w, 200h"
        bind:value={sizeConstraint}
        on:input={onChangeConfig}
      />
    </div>
    <div class="section">
      <Section>Format</Section>
      <SelectMenu
        bind:menuItems={extensionOptions}
        bind:value={extensionOption}
        on:change={onChangeConfig}
      />
    </div>
  </div>

  <Section>Output</Section>
  <div class="example">
    {#if exampleAssets.length > 0}
      {#each exampleAssets as exampleAsset, index}
        {#if index > 0}
          <hr />
        {/if}
        <div class="example-row">
          <span class="example-row-filename">
            {exampleAsset.filename}.{exampleAsset.extension.toLowerCase()}
          </span>
          <span>
            {displaySize(exampleAsset.size)}
          </span>
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
  .row {
    display: flex;
    flex: 1;
    flex-direction: row;
    gap: 8px;
  }
  .section {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .button-holder {
    margin-top: 8px;
  }
  .example {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: 142px;
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
    gap: 8px;
  }
  .example-row-filename {
    display: flex;
    white-space: nowrap;
    overflow-x: scroll;
  }
  .example-row-filename::-webkit-scrollbar {
    display: none;
  }
  .example-text-placeholder {
    color: rgb(138, 138, 138);
  }
  input {
    font-size: smaller;
    height: 32px;
    padding-left: 8px;
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
