<script lang="ts" type="module">
  import "../styles/main.css";
  import { onMount } from "svelte";
  import { Section, Type, Input, Icon, IconForward } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";
  import { Asset, Config, NameConfig } from "./types";
  import Divider from "./components/Divider.svelte";
  import OutputPreview from "./components/OutputPreview.svelte";
  import NameOptions from "./components/NameOptions.svelte";
  import ExcludeOptions from "./components/ExcludeOptions.svelte";

  let config: Config = {
    syntax: "",
    connector: "",
    casing: "camel",
    sizeConstraint: "",
    extension: "PNG",
    hideNodes: [],
  };

  let nodeCount = 0;
  let exampleAssets: Asset[] = [];

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;

    if (type === "load") {
      config = message.config as Config;
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

  const onChangeNameConfig = (nameConfig: NameConfig) => {
    config = {
      ...nameConfig,
      hideNodes: config.hideNodes,
    };
    onChangeConfig();
  };

  const onChangeExcludeConfig = (hideNodes: string[]) => {
    config = {
      ...config,
      hideNodes,
    };
    onChangeConfig();
  };

  const onChangeConfig = () => {
    console.log("Updated config:", config);

    parent.postMessage(
      {
        pluginMessage: {
          type: "config",
          config,
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
          config,
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

<div class="flex flex-1 flex-col">
  <div class="section">
    <NameOptions nameConfig={config} {onChangeNameConfig} />
  </div>

  <Divider />

  <div class="section">
    <ExcludeOptions hideNodes={config.hideNodes} {onChangeExcludeConfig} />
  </div>

  <Divider />

  <div class="section">
    <OutputPreview {exampleAssets} />
  </div>

  <Divider />

  <div
    class={"flex flex-1 flex-row items-center justify-between px-4 pt-3 cursor-pointer " +
      (nodeCount > 0 ? "opacity-80 hover:opacity-100" : "opacity-50 hover:opacity-60")}
    disabled={nodeCount === 0}
    on:click={onSelectExport}
  >
    <Type weight="bold">Export {nodeCount} images</Type>
    <Icon iconName={IconForward} />
  </div>
</div>
