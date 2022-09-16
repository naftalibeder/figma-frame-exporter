import {
  Exportable,
  Variant,
  Config,
  Asset,
  PreviewSettings,
  LayerMod,
  ExportPayload,
  LayerModMatches,
} from "./types";
import { withCasing, buildExportSettings, log } from "./utils";

figma.showUI(__html__, { width: 360, height: 907 });

type StoreType = {
  selectedConfigId: string;
  configs: Record<string, Config>;
};

const STORE_NAME = "store";

let previewTimer: number | undefined;

class Store {
  private static defaultConfig = (): Config => {
    return {
      id: `${Math.random()}`,
      syntax: "$F$V",
      connectors: {
        before: "",
        between: "",
        after: "",
      },
      casing: "original",
      sizeConstraint: "2x",
      extension: "PNG",
      layerMods: [
        { id: `${Math.random()}`, query: undefined, property: undefined, value: undefined },
      ],
    };
  };

  static getCurrentConfig = async (): Promise<Config> => {
    let store: StoreType | undefined = await figma.clientStorage.getAsync(STORE_NAME);
    let configs = store?.configs;
    log("Store:", store);

    if (configs) {
      return configs[store.selectedConfigId];
    } else {
      return this.defaultConfig();
    }
  };

  static setCurrentConfig = async (config: Config): Promise<Config> => {
    let store: StoreType | undefined = await figma.clientStorage.getAsync(STORE_NAME);
    let configs = store?.configs;

    if (configs) {
      configs[config.id] = config;
    } else {
      configs = { [config.id]: config };
    }

    store = {
      selectedConfigId: config.id,
      configs,
    };

    log("Setting store:", store);

    try {
      await figma.clientStorage.setAsync(STORE_NAME, store);
    } catch (e) {
      log("Error setting store:", e);
    }

    return store.configs[config.id];
  };
}

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
      const children = node.children;

      for (const child of children) {
        const pairs = child.name.split(", ");

        let variants: Variant[] = [];
        for (const pair of pairs) {
          const [property, value] = pair.split("=");
          variants.push({
            property,
            value,
          });
        }

        exportables.push({
          id: child.id,
          parentName: node.name,
          variants,
          size: { width: child.width, height: child.height },
        });
      }
    } else if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "GROUP") {
      exportables.push({
        id: node.id,
        parentName: node.name,
        variants: [],
        size: { width: node.width, height: node.height },
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
  const { syntax, connectors, casing, extension, sizeConstraint, layerMods } = config;

  tempFrame.create();

  let hasVariants = false;

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

    let node = (figma.getNodeById(e.id) as FrameNode).clone();

    // Modify node or its children if matched by a layer mod's query.
    for (const layerMod of layerMods) {
      const { node: modifiedNode, matchedNodeCount } = withLayerMods(node, layerMod);
      node = modifiedNode;
      tempFrame.frame?.appendChild(node);

      layerModMatches[layerMod.id] += matchedNodeCount;
    }

    // Build concatenated variants part of filename.
    let variantsStr = "";
    e.variants.forEach((variant, i) => {
      const value = withCasing(variant.value, casing);
      if (i > 0) {
        variantsStr += `${connectors.between}${value}`;
      } else {
        variantsStr += value;
      }
    });
    if (variantsStr.length > 0) {
      hasVariants = true;
    }
    if (connectors.before.length > 0) {
      variantsStr = connectors.before + variantsStr;
    }
    if (connectors.after.length > 0) {
      variantsStr = variantsStr + connectors.after;
    }

    // Build full filename.
    const filename = syntax
      .replace("$F", withCasing(e.parentName, casing))
      .replace("$V", variantsStr);
    asset.filename = filename;

    // Generate image data.
    const baseExportConfig = {
      extension,
      constraint: sizeConstraint,
      srcSize: e.size,
    };
    const { destSize } = buildExportSettings(baseExportConfig);
    asset.size = destSize;
    const { settings } = buildExportSettings(
      previewSettings.isFinal
        ? baseExportConfig
        : {
            extension: "PNG",
            constraint: "",
            srcSize: previewSettings.thumbSize,
          }
    );
    try {
      asset.data = await (<ExportMixin>node).exportAsync(settings);
    } catch (e) {
      log(e);
      continue;
    }

    assets.push(asset);
  }

  tempFrame.remove();

  return { nodeCount: exportables.length, hasVariants, layerModMatches, assets };
};

const withLayerMods = (
  node: FrameNode,
  layerMod: LayerMod
): { node: FrameNode; matchedNodeCount: number } => {
  const query = layerMod.query?.trim() ?? "";
  const { property, value } = layerMod;

  let matchedNodes: SceneNode[] = [];
  if (query?.length > 0) {
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

const refreshPreviewDebounced = (config: Config | undefined) => {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => refreshPreview(config), 50);
};

const refreshPreview = async (config: Config | undefined, limit: number = 20) => {
  const exportables = getExportables().slice(0, limit);

  log("Exportables:", exportables);

  let exportPayload: ExportPayload | undefined;
  if (config) {
    exportPayload = await getExportPayload(exportables, config, {
      isFinal: false,
      thumbSize: { width: 32, height: 32 },
    });
  }

  if (!exportPayload) {
    return;
  }

  figma.ui.postMessage({
    type: "preview",
    exportPayload,
  });
};

const generateExport = async (config: Config) => {
  const exportables = getExportables();
  const exportPayload = await getExportPayload(exportables, config, { isFinal: true });

  figma.ui.postMessage({
    type: "export",
    exportPayload,
  });
};

figma.ui.onmessage = async (message) => {
  const type = message.type;
  log("Message:", type);

  if (type === "init") {
    const storedConfig = await Store.getCurrentConfig();
    figma.ui.postMessage({ type: "load", config: storedConfig });
    refreshPreviewDebounced(storedConfig);
  } else if (type === "config") {
    const storedConfig = await Store.setCurrentConfig(message.config);
    refreshPreviewDebounced(storedConfig);
  } else if (type === "export") {
    generateExport(message.config);
  }
};

figma.on("selectionchange", async () => {
  const storedConfig = await Store.getCurrentConfig();
  refreshPreviewDebounced(storedConfig);
});

figma.on("close", () => {
  tempFrame.remove();
  log("Exited");
});
