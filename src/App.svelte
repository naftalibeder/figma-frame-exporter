<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Button, Section, SelectMenu } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";
  import type { Asset, Casing, Config, Extension, Size } from "./types";
  import { isVariableDeclarationList } from "typescript";

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

  let syntax: string | undefined = undefined;
  let connector: string | undefined = undefined;

  let casing: Casing | undefined = undefined;
  let casingOptions: CasingOption[] = [
    { value: "lower", label: "Lower", group: null, selected: false },
    { value: "upper", label: "Upper", group: null, selected: false },
    { value: "title", label: "Title", group: null, selected: false },
  ];
  $: {
    casingOptions.forEach((o, i) => {
      casingOptions[i].selected = o.value === casing;
    });
  }

  let sizeConstraint: string | undefined = undefined;

  let extension: Extension | undefined = undefined;
  let extensionOptions: ExtensionOption[] = [
    { value: "PNG", label: "PNG", group: null, selected: false },
    { value: "JPG", label: "JPG", group: null, selected: false },
    { value: "SVG", label: "SVG", group: null, selected: false },
    { value: "PDF", label: "PDF", group: null, selected: false },
  ];
  $: {
    extensionOptions.forEach((o, i) => {
      extensionOptions[i].selected = o.value === extension;
    });
  }

  let hideNodesStr = "";
  let hideNodes: string[] = [];
  $: {
    hideNodes = hideNodesStr
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    console.log(hideNodes);
  }

  let nodeCount = 0;
  let exampleAssets: Asset[] = [];

  const displaySize = (size: Size): string => {
    const rounded: Size = {
      width: Math.round(size.width),
      height: Math.round(size.height),
    };
    return `${rounded.width}x${rounded.height}`;
  };

  const buildConfig = (): Config => {
    return {
      syntax,
      connector,
      casing,
      sizeConstraint,
      extension,
      hideNodes,
    };
  };

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;

    if (type === "load") {
      const config = message.config as Config;
      console.log("Loaded stored config:", config);

      syntax = config.syntax;
      connector = config.connector;
      casing = config.casing;
      sizeConstraint = config.sizeConstraint;
      extension = config.extension;
      hideNodesStr = config.hideNodes.join(", ");
    } else if (type === "preview") {
      const preview = message.preview;
      nodeCount = preview.nodeCount;
      exampleAssets = preview.exampleAssets;
      exampleAssets = await buildPreviewImages(exampleAssets);
    } else if (type === "export") {
      const url = await buildZipArchive(message.assets);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Export.zip";
      link.click();
    }
  };

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "init",
        },
      },
      "*"
    );
  });

  const onChangeConfig = () => {
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

  const buildPreviewImages = async (assets: Asset[]): Promise<Asset[]> => {
    assets.forEach((asset) => {
      let blob = new Blob([asset.data], { type: `image/png` });
      const url = window.URL.createObjectURL(blob);
      asset.url = url;
    });
    return assets;
  };

  const buildZipArchive = async (assets: Asset[]): Promise<string> => {
    let zip = new JSZip();

    assets.forEach((asset) => {
      const extensionLower = asset.extension.toLowerCase();
      let blob = new Blob([asset.data], { type: `image/${extensionLower}` });
      zip.file(`${asset.filename}.${extensionLower}`, blob, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);
    return url;
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
      <Section>Connector</Section>
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
        on:change={(e) => {
          casing = e.detail.value;
          onChangeConfig();
        }}
      />
    </div>
  </div>

  <div class="row">
    <div class="section">
      <Section>Size</Section>
      <input
        type="text"
        placeholder="E.g. 2x, 64w, 200h"
        disabled={!extension || extension === "SVG"}
        bind:value={sizeConstraint}
        on:input={onChangeConfig}
      />
    </div>
    <div class="section">
      <Section>Format</Section>
      <SelectMenu
        bind:menuItems={extensionOptions}
        on:change={(e) => {
          extension = e.detail.value;
          onChangeConfig();
        }}
      />
    </div>
  </div>

  <div class="row">
    <div class="section">
      <Section>Hide children</Section>
      <input
        type="text"
        placeholder="Comma-separated layer names"
        bind:value={hideNodesStr}
        on:input={onChangeConfig}
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
          <img
            class="example-row-thumb"
            src={exampleAsset.url}
            alt="asset thumbnail"
          />
          <span class="example-row-filename">
            {exampleAsset.filename}.{exampleAsset.extension.toLowerCase()}
          </span>
          {#if exampleAsset.size}
            <span>
              {displaySize(exampleAsset.size)}
            </span>
          {/if}
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
    height: 166px;
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
    gap: 4px;
  }
  .example-row-thumb {
    width: 16px;
    height: 16px;
  }
  .example-row-filename {
    display: flex;
    flex: 1;
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
  input:disabled {
    color: rgb(173, 173, 173);
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
