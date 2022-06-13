import { Exportable, Variant, Config, Asset, PreviewSettings } from "./types";
import { withCasing, buildExportSettings, log } from "./utils";

figma.showUI(__html__, { width: 340, height: 560 });

class StoredConfig {
  static get = async (): Promise<Config> => {
    let _config = await figma.clientStorage.getAsync('config');
    if (!_config) {
      return {
        syntax: "{frame}{connector}{variant}",
        connector: '.',
        casing: 'original',
        sizeConstraint: '2x',
        extension: 'PNG',
        hideNodes: [],
      }
    } else {
      return _config;
    }
  };

  static set = async (_config: Config): Promise<Config> => {
    await figma.clientStorage.setAsync('config', _config);
    return _config;
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
    } else if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'GROUP') {
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

const getAssets = async (
  exportables: readonly Exportable[],
  config: Config,
  previewSettings: PreviewSettings,
): Promise<Asset[]> => {
  const { syntax, connector, casing, extension, sizeConstraint, hideNodes } = config;

  tempFrame.create();

  let assets: Asset[] = [];

  for (const e of exportables) {
    let asset: Asset = {
      filename: '',
      extension,
      size: undefined,
      data: new Uint8Array,
    };

    let originalNode = figma.getNodeById(e.id) as FrameNode;

    // Modify node if needed.
    let modifiedNode = originalNode.clone();
    modifiedNode = withModificationsForExport(modifiedNode, hideNodes);
    if (tempFrame.frame) {
      tempFrame.frame.appendChild(modifiedNode);
    }

    // Build filename.
    let variantsStr = "";
    e.variants.forEach((variant, i) => {
      const value = withCasing(variant.value, casing);
      if (i > 0) {
        variantsStr += `${connector}${value}`;
      } else {
        variantsStr += value;
      }
    });
    const hasVariants = variantsStr.length > 0;
    const filename = syntax
      .replace("{frame}", withCasing(e.parentName, casing))
      .replace("{connector}", hasVariants ? connector : "")
      .replace("{variant}", variantsStr);
    asset.filename = filename;

    // Generate image data.
    const baseExportConfig = {
      extension,
      constraint: sizeConstraint,
      srcSize: e.size,
    };
    const { destSize } = buildExportSettings(baseExportConfig);
    asset.size = destSize;
    const { settings } = buildExportSettings(previewSettings.isFinal ? baseExportConfig : {
      extension: 'PNG',
      constraint: '',
      srcSize: previewSettings.thumbSize,
    });
    try {
      asset.data = await (<ExportMixin>modifiedNode).exportAsync(settings);
    } catch (e) {
      log(e);
      continue;
    }

    assets.push(asset);
  }

  tempFrame.remove();

  return assets;
};

const withModificationsForExport = (node: FrameNode, hideNodes: string[]): FrameNode => {
  const nodesToHide = node.findAll(c => hideNodes.includes(c.name));
  for (const n of nodesToHide) {
    n.visible = false;
  }

  return node;
}

const refreshPreview = async (config: Config | undefined) => {
  const exportables = getExportables();

  let exampleAssets: Asset[] = [];
  if (config) {
    exampleAssets = await getAssets(
      exportables,
      config,
      {
        isFinal: false,
        thumbSize: { width: 32, height: 32 },
      });
  }

  figma.ui.postMessage({
    type: "preview",
    preview: {
      nodeCount: exportables.length,
      exampleAssets,
    }
  });
};

const generateExport = async (config: Config) => {
  const exportables = getExportables();
  const assets = await getAssets(
    exportables,
    config,
    { isFinal: true },
  );
  figma.ui.postMessage({
    type: "export",
    assets,
  });
};

figma.ui.onmessage = async (message) => {
  const type = message.type;
  log('Message:', type);

  if (type === "init") {
    const storedConfig = await StoredConfig.get();
    log("Loaded stored config:", storedConfig);
    figma.ui.postMessage({ type: "load", config: storedConfig });
    await refreshPreview(storedConfig);
  } else if (type === "config") {
    const storedConfig = await StoredConfig.set(message.config);
    await refreshPreview(storedConfig);
  } else if (type === "export") {
    await generateExport(message.config);
  }
};

figma.on("selectionchange", async () => {
  const storedConfig = await StoredConfig.get();
  await refreshPreview(storedConfig);
});

figma.on('close', () => {
  tempFrame.remove();
  log('closed');
});