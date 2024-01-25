<script lang="ts" type="module">
  import { onMount } from "svelte";
  import JSZip from "../../node_modules/jszip/dist/jszip.min.js";
  import { Type, Icon, Divider } from "figma-svelte-components";
  import { store } from "../store";
  import { delay, log } from "../utils";
  import { Asset, Config, ExportPayload, LayerModMatches } from "../types";
  import {
    SelectedConfigOptions,
    NameOptions,
    ImageOptions,
    LayerModList,
    OutputPreview,
  } from "../components";

  let config: Config = $store.configs[$store.selectedConfigId];

  let nodeCount = 0;
  let layerModMatches: LayerModMatches = {};
  let exampleAssets: Asset[] = [];
  let exportLoading = false;
  $: exportButtonDisabled = nodeCount === 0 || exportLoading;

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "INIT",
        },
      },
      "*"
    );
  });

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    if (!message) {
      return;
    }

    const type = message.type;
    log("Message:", type, message);

    if (type === "PREVIEW") {
      const exportPayload = message.exportPayload as ExportPayload;
      nodeCount = exportPayload.nodeCount;
      layerModMatches = exportPayload.layerModMatches;
      exampleAssets = await buildPreviewImages(exportPayload.assets);
    } else if (type === "EXPORT") {
      const exportPayload = message.exportPayload as ExportPayload;
      await presentDownloadableArchive(exportPayload.assets);
      exportLoading = false;
    }
  };

  const onChangeConfig = () => {
    log("Changed config:", $store.selectedConfigId);
    config = $store.configs[$store.selectedConfigId];
  };

  const onUpdateConfig = () => {
    log("Updated config:", config);
    $store = {
      selectedConfigId: config.id,
      configs: {
        ...$store.configs,
        [config.id]: config,
      },
    };
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
          type: "EXPORT",
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

<div class="flex flex-1 flex-col overflow-y-hidden">
  <div class="flex flex-1 flex-col w-full overflow-y-scroll">
    {#if Object.keys($store.configs).length > 1}
      <div class="section">
        <SelectedConfigOptions
          selectedConfigId={config.id}
          configs={$store.configs}
          onChange={(id) => {
            $store.selectedConfigId = id;
            onChangeConfig();
          }}
        />
      </div>

      <Divider />
    {/if}

    <div class="section">
      <NameOptions
        nameConfig={config}
        onChange={(nameConfig) => {
          config = {
            ...config,
            ...nameConfig,
          };
          onUpdateConfig();
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
          onUpdateConfig();
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
          onUpdateConfig();
        }}
      />
    </div>

    <Divider />

    <div class="section">
      <OutputPreview totalNodeCt={nodeCount} {exampleAssets} />
    </div>
  </div>

  <button
    class="flex flex-col justify-center w-full h-16"
    style="background-color: var(--figma-color-bg)"
    disabled={exportButtonDisabled}
    on:click={onSelectExport}
  >
    <Divider />

    <div
      class={"grid grid-cols-2 items-center pl-4 pr-2 pointer-events-none " +
        (exportButtonDisabled
          ? "opacity-50 hover:opacity-60"
          : "opacity-80 hover:opacity-100")}
    >
      <Type weight="weight-bold">
        {exportLoading ? "Generating export..." : `Export ${nodeCount} images`}
      </Type>
      <Icon kind={"right"} />
    </div>
  </button>
</div>
