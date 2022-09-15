<script lang="ts" type="module">
  import "../styles/main.css";
  import { onMount } from "svelte";
  import { Type, Icon, IconForward } from "figma-plugin-ds-svelte";
  import JSZip from "../node_modules/jszip/dist/jszip.min.js";
  import { delay, log } from "utils";
  import { Asset, Config, ExportPayload, LayerModMatches } from "./types";
  import Divider from "./components/Divider.svelte";
  import OutputPreview from "./components/OutputPreview.svelte";
  import NameOptions from "./components/NameOptions.svelte";
  import LayerModList from "./components/LayerModList.svelte";
  import ImageOptions from "./components/ImageOptions.svelte";

  let config: Config = {
    syntax: "",
    connectors: {
      before: "",
      between: "",
      after: "",
    },
    casing: "camel",
    sizeConstraint: "",
    extension: "PNG",
    layerMods: [],
  };
  let nodeCount = 0;
  let layerModMatches: LayerModMatches = {};
  let exampleAssets: Asset[] = [];
  let exportLoading = false;
  $: exportButtonDisabled = nodeCount === 0 || exportLoading;

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;

    if (type === "load") {
      config = message.config as Config;
    } else if (type === "preview") {
      const exportPayload = message.exportPayload as ExportPayload;
      nodeCount = exportPayload.nodeCount;
      layerModMatches = exportPayload.layerModMatches;
      exampleAssets = await buildPreviewImages(exportPayload.assets);
    } else if (type === "export") {
      const exportPayload = message.exportPayload as ExportPayload;
      await presentDownloadableArchive(exportPayload.assets);
      exportLoading = false;
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
    log("Updated config:", config);

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

  const onSelectExport = async () => {
    if (exportButtonDisabled) {
      return;
    }

    exportLoading = true;
    await delay(10);
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

  const presentDownloadableArchive = async (assets: Asset[]) => {
    let zip = new JSZip();

    assets.forEach((asset) => {
      const extensionLower = asset.extension.toLowerCase();
      let blob = new Blob([asset.data], { type: `image/${extensionLower}` });
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

<div class="flex flex-1 flex-col">
  <div class="section">
    <NameOptions
      nameConfig={config}
      onChange={(nameConfig) => {
        config = {
          ...config,
          ...nameConfig,
        };
        onChangeConfig();
      }}
    />
  </div>

  <Divider />

  <div class="section">
    <ImageOptions
      imageConfig={config}
      onChange={(imageConfig) => {
        config = {
          ...config,
          ...imageConfig,
        };
        onChangeConfig();
      }}
    />
  </div>

  <Divider />

  <div class="section">
    <LayerModList
      layerMods={config.layerMods}
      {layerModMatches}
      onChangeLayerMods={(layerMods) => {
        config = {
          ...config,
          layerMods,
        };
        onChangeConfig();
      }}
    />
  </div>

  <Divider />

  <div class="section">
    <OutputPreview {exampleAssets} />
  </div>

  <Divider />

  <div
    class={"flex flex-1 flex-row items-center justify-between px-4 pt-3 cursor-pointer " +
      (exportButtonDisabled ? "opacity-50 hover:opacity-60" : "opacity-80 hover:opacity-100")}
    disabled={exportButtonDisabled}
    on:click={onSelectExport}
  >
    <Type weight="bold">
      {exportLoading ? "Generating export..." : `Export ${nodeCount} images`}
    </Type>
    <Icon iconName={IconForward} />
  </div>
</div>
