import {
  Exportable,
  VariantInstance,
  Config,
  Asset,
  PreviewSettings,
  LayerMod,
  ExportPayload,
  LayerModMatches,
  Store,
} from "./types";
import { withCasing, buildExportSettings, log, buildDefaultConfig } from "./utils";

figma.showUI(__html__, { width: 360, height: 900, themeColors: true });

// Store.

const STORE_NAME = "store";

const defaultStore: Store = (() => {
  const initialConfig = buildDefaultConfig(0);

  return {
    selectedConfigId: initialConfig.id,
    configs: {
      [initialConfig.id]: initialConfig,
    },
  };
})();

const getStore = async (): Promise<Store> => {
  let store: Store | undefined;
  try {
    store = await figma.clientStorage.getAsync(STORE_NAME);
    if (!store) {
      throw new Error("Store is undefined");
    }
    log("Get store:", store);
  } catch (e) {
    store = defaultStore;
    log("Error getting store:", e);
  }

  const configEntries = Object.entries(store.configs);
  // Migrate order indices if needed.
  if (configEntries.some(([k, v]) => v.index === undefined)) {
    configEntries.forEach(([k, v], i) => {
      store.configs[k].index = i;
    });
  }

  // Migrate connectors if needed.
  configEntries.forEach(([k, v], i) => {
    if (v["connectors"]) {
      const connector = v["connectors"]["between"];
      store.configs[k].connector = connector;
      delete store.configs[k]["connectors"];
    }
  });

  return store;
};

const setStore = async (store: Store): Promise<Store> => {
  try {
    await figma.clientStorage.setAsync(STORE_NAME, store);
    log("Set store:", store);
  } catch (e) {
    log("Error setting store:", e);
  }

  return store;
};

// Everything.

let previewTimer: number | undefined;

class TempFrame {
  frame: FrameNode | undefined;

  create = () => {
    if (this.frame) {
      this.frame.remove();
      this.frame = undefined;
    }

    this.frame = figma.createFrame();
    this.frame.name = "[Frame Exporter]";
    this.frame.clipsContent = false;
    this.frame = this.frame;
  };

  remove = () => {
    this.frame?.remove();
    this.frame = undefined;
  };
}
const tempFrame = new TempFrame();

const getExportables = (): Exportable[] => {
  const nodes = figma.currentPage.selection;
  const exportables: Exportable[] = [];

  for (const node of nodes) {
    if (node.type === "COMPONENT_SET") {
      const children = node.children as ComponentNode[];

      // Normalize each variant property type.
      const variantPropertyTypes: Record<string, "text" | "boolean"> = {};
      Object.entries(node.componentPropertyDefinitions).forEach(([k, v]) => {
        const options = new Set(v.variantOptions);
        const isBool = options.size === 2 && options.has("true") && options.has("false");
        variantPropertyTypes[k] = isBool ? "boolean" : "text";
      });
      log("Variant property types:", variantPropertyTypes);

      for (const child of children) {
        const variantProperties = child.variantProperties;
        let variants: VariantInstance[] = Object.entries(variantProperties).map(([k, v]) => {
          return {
            type: variantPropertyTypes[k],
            property: k,
            value: v,
          };
        });
        log("Variant instances:", variants);

        exportables.push({
          id: child.id,
          parentName: node.name,
          variants,
          size: {
            width: child.width,
            height: child.height,
          },
        });
      }
    } else if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "GROUP") {
      exportables.push({
        id: node.id,
        parentName: node.name,
        variants: [],
        size: {
          width: node.width,
          height: node.height,
        },
      });
    }
  }

  return exportables;
};

const getExportPayload = async (
  exportables: readonly Exportable[],
  config: Config,
  previewSettings: PreviewSettings
): Promise<ExportPayload> => {
  const { syntax, connector, casing, extension, sizeConstraint, layerMods } = config;

  tempFrame.create();

  let layerModMatches: LayerModMatches = {};
  for (const layerMod of layerMods) {
    layerModMatches[layerMod.id] = 0;
  }

  let assets: Asset[] = [];

  for (const e of exportables) {
    const asset: Asset = {
      filename: "",
      extension,
      size: undefined,
      data: new Uint8Array(),
    };

    let node = figma.getNodeById(e.id) as FrameNode;

    // Modify node or its children if matched by a layer mod's query.
    for (const layerMod of layerMods) {
      const payload = withLayerMods(node, layerMod);
      node = payload.node;
      tempFrame.frame?.appendChild(node);

      layerModMatches[layerMod.id] += payload.matchedNodeCount;
    }

    // Build part of filename based on existing variants.
    let variantsPart = "";
    let displayedIndex = 0;
    e.variants.forEach((variant) => {
      let part = variant.value;

      // If variant is boolean, show property name (instead of value) when value
      // is `true`, nothing when value is `false`.
      if (variant.type === "boolean") {
        part = variant.value === "true" ? variant.property : "";
      }

      if (part === "") {
        return;
      }

      part = withCasing(part, casing);

      if (displayedIndex > 0) {
        variantsPart = `${variantsPart}${connector}${part}`;
      } else {
        variantsPart = part;
      }

      displayedIndex += 1;
    });

    const parentNamePart = withCasing(e.parentName, casing);

    // Build full filename.
    const replacements = [
      ["$F", parentNamePart],
      ["$V", variantsPart],
    ];
    let filename = syntax;
    replacements.forEach(([slug, display]) => {
      filename = filename.split(slug).join(display);
    });
    asset.filename = filename;

    // Generate image data.
    const baseExportConfig = {
      extension,
      constraint: sizeConstraint,
      srcSize: e.size,
    };
    let settings: ExportSettings;
    if (previewSettings.isFinal) {
      const payload = buildExportSettings(baseExportConfig);
      settings = payload.settings;
    } else {
      let displayPayload = buildExportSettings(baseExportConfig);
      asset.size = displayPayload.destSize;
      const payload = buildExportSettings({
        extension: "PNG",
        constraint: "",
        srcSize: previewSettings.thumbSize,
      });
      settings = payload.settings;
    }

    try {
      asset.data = await (<ExportMixin>node).exportAsync(settings);
    } catch (e) {
      log(e);
      continue;
    }

    assets.push(asset);
  }

  tempFrame.remove();

  return { nodeCount: exportables.length, layerModMatches, assets };
};

const withLayerMods = (
  node: FrameNode,
  layerMod: LayerMod
): { node: FrameNode; matchedNodeCount: number } => {
  node = node.clone();

  const query = layerMod.query?.trim() ?? "";
  const { property, value } = layerMod;

  let matchedNodes: SceneNode[] = [];
  if (query && query.length > 0) {
    matchedNodes = node.findAll((o) => {
      try {
        const m = o.name.match(query) !== null;
        return m;
      } catch (e) {
        log(`Cannot match '${o.name}' to '${query}': ${e}`);
        return false;
      }
    });
  }

  log(`Matched ${layerMod.query} to ${matchedNodes.length} layers`);

  if (!property || !value) {
    return { node, matchedNodeCount: matchedNodes.length };
  }

  for (const n of matchedNodes) {
    try {
      const _type = typeof n[property];

      let _value: any;
      if (_type === "number") {
        _value = parseFloat(value);
      } else if (_type === "boolean") {
        _value = value === "true";
      } else {
        _value = value;
      }

      n[property] = _value;
    } catch (e) {
      log(`Could not assign '${value}' to property '${property}' in layer '${n.name}':`, e);
    }
  }

  return { node, matchedNodeCount: matchedNodes.length };
};

const refreshPreview = (config: Config | undefined) => {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => _refreshPreview(config), 200);
};

const _refreshPreview = async (config: Config | undefined, limit: number = 20) => {
  const exportables = getExportables().slice(0, limit);

  log("Exportables:", exportables);

  let exportPayload: ExportPayload | undefined;
  if (config) {
    try {
      exportPayload = await getExportPayload(exportables, config, {
        isFinal: false,
        thumbSize: { width: 32, height: 32 },
      });
    } catch (e) {
      console.error("Preview error:", e);
    }
  }

  if (!exportPayload) {
    return;
  }

  figma.ui.postMessage({
    type: "PREVIEW",
    exportPayload,
  });
};

const generateExport = async (config: Config) => {
  const exportables = getExportables();
  const exportPayload = await getExportPayload(exportables, config, { isFinal: true });

  figma.ui.postMessage({
    type: "EXPORT",
    exportPayload,
  });
};

figma.ui.onmessage = async (message) => {
  const type = message.type;
  log("Message:", type, message);

  if (type === "INIT") {
    const store = await getStore();
    figma.ui.postMessage({ type: "LOAD", store });
    const config = store.configs[store.selectedConfigId];
    refreshPreview(config);
  } else if (type === "SET_STORE") {
    const store = await setStore(message.store);
    const config = store.configs[store.selectedConfigId];
    refreshPreview(config);
  } else if (type === "EXPORT") {
    generateExport(message.config);
  }
};

figma.on("selectionchange", async () => {
  const store = await getStore();
  const config = store.configs[store.selectedConfigId];
  refreshPreview(config);
});

figma.on("close", () => {
  tempFrame.remove();
  log("Exited");
});
