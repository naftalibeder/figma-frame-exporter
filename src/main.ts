import { Exportable, Variant, Config, Asset, AssetInfo } from "./types";
import { cased } from "./utils";

figma.showUI(__html__, { width: 300, height: 542 });

let storedConfig: Config | undefined;

const getExportables = (): Exportable[] => {
  const nodes = figma.currentPage.selection;
  const exportables: Exportable[] = [];

  for (const node of nodes) {
    if (node.type === "COMPONENT_SET") {
      const children = node.children;

      for (const child of children) {
        console.log(child.height, child.width);
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
  const { format, connector, casing } = config;

  let assets: Asset[] = [];

  exportables.forEach(async (exportable) => {
    const node = figma.getNodeById(exportable.id) as SceneNode;

    let variantsStr = "";
    exportable.variants.forEach((variant) => {
      const value = cased(variant.value, casing);
      variantsStr += `${connector}${value}`;
    });

    let filename = format
      .replace("{f}", cased(exportable.parentName, casing))
      .replace("{v}", variantsStr);

    const scale = 4;
    const data = await (<ExportMixin>node).exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: scale },
    });
    assets.push({
      filename,
      data,
      size: {
        width: exportable.size.width * scale,
        height: exportable.size.height * scale,
      },
    });
  });

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
    console.log(message.config);
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
