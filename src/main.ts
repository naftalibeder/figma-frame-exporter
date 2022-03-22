import { Exportable, Variant, Config, Asset, AssetInfo } from "./types";
import { cased, log, sizeContraint } from "./utils";

figma.showUI(__html__, { width: 340, height: 542 });

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
  config: Config
): Promise<Asset[]> => {
  const { syntax, connector, casing, extension } = config;

  let assets: Asset[] = [];

  for (const exportable of exportables) {
    const node = figma.getNodeById(exportable.id) as SceneNode;

    let variantsStr = "";
    exportable.variants.forEach((variant, i) => {
      const value = cased(variant.value, casing);
      if (i > 0) {
        variantsStr += `${connector}${value}`;
      } else {
        variantsStr += value;
      }
    })

    let filename = syntax
      .replace("{frame}", cased(exportable.parentName, casing))
      .replace("{variant}", variantsStr);

    const { constraint, destSize } = sizeContraint(
      config.sizeConstraint,
      exportable.size
    );

    let data: Uint8Array;
    try {
      data = await (<ExportMixin>node).exportAsync({
        format: extension,
        constraint,
      });
    } catch (e) {
      log(e);
      continue;
    }

    assets.push({
      filename,
      extension,
      data,
      size: {
        width: destSize.width,
        height: destSize.height,
      },
    });
  }

  return assets;
};

const refreshUI = async () => {
  const exportables = getExportables();

  let exampleAssets: AssetInfo[] = [];
  if (storedConfig) {
    const assets = await getAssets(exportables, storedConfig);
    exampleAssets = assets.map((a) => {
      return {
        filename: a.filename,
        extension: a.extension,
        size: a.size,
      };
    });
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
    const assets = await getAssets(exportables, message.config);
    figma.ui.postMessage({ type: "export", assets });
  } else if (type === "cancel") {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshUI();
});
