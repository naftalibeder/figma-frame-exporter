import { Exportable, Variant, Config, Asset, Size } from "./types";
import { withCasing, buildExportSettings, log } from "./utils";

figma.showUI(__html__, { width: 340, height: 492 });

let storedConfig: Config | undefined;

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
    } else {
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
  isFinal: boolean,
): Promise<Asset[]> => {
  const { syntax, connector, casing, extension } = config;

  let assets: Asset[] = [];

  for (const e of exportables) {
    const node = figma.getNodeById(e.id) as SceneNode;

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

    let data: Uint8Array;
    let size: Size;
    try {
      const exportConfigInfo = {
        extension: extension,
        constraint: config.sizeConstraint,
        srcSize: e.size,
      };
      const { destSize } = buildExportSettings(exportConfigInfo);

      const exportConfigData = {
        extension: extension,
        constraint: config.sizeConstraint,
        srcSize: e.size,
      };
      log(isFinal);
      if (!isFinal) {
        // Limit generated size of preview images.
        exportConfigData.constraint = '';
        exportConfigData.srcSize = { width: 16, height: 16 };
      }
      const { settings } = buildExportSettings(exportConfigData);
      size = destSize;
      data = await (<ExportMixin>node).exportAsync(settings);
    } catch (e) {
      log(e);
      continue;
    }

    assets.push({
      filename,
      extension,
      size,
      data,
      isFinal,
    });
  }

  return assets;
};

const refreshUI = async () => {
  const exportables = getExportables();

  let exampleAssets: Asset[] = [];
  if (storedConfig) {
    exampleAssets = await getAssets(exportables, storedConfig, false);
  }

  figma.ui.postMessage({
    type: "refresh",
    nodeCount: exportables.length,
    exampleAssets,
  });
};

figma.ui.onmessage = async (message) => {
  const type = message.type;

  if (type === "init") {
    storedConfig = message.config;
    refreshUI();
  } else if (type === "config") {
    storedConfig = message.config;
    refreshUI();
  } else if (type === "export") {
    const exportables = getExportables();
    const assets = await getAssets(exportables, message.config, true);
    figma.ui.postMessage({ type: "export", assets });
  } else if (type === "cancel") {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshUI();
});
