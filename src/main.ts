figma.showUI(__html__, { width: 300, height: 500 });

type Casing = "lower" | "upper" | "title";

interface Config {
  format: string;
  connector: string;
  casing: Casing;
}

interface Variant {
  property: string;
  value: string;
}

interface Exportable {
  id: string;
  parentName: string;
  variants: Variant[];
}

interface Asset {
  filename: string;
  data: Uint8Array;
}

const getExportables = () => {
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
        });
      }
    } else {
      exportables.push({
        id: node.id,
        parentName: node.name,
        variants: [],
      });
    }
  }

  return exportables;
};

const cased = (value: string, casing: Casing) => {
  if (casing === "lower") {
    return value.toLowerCase();
  } else if (casing === "upper") {
    return value.toUpperCase();
  } else if (casing === "title") {
    return value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
  }
};

const getAssets = async (
  exportables: readonly Exportable[],
  config: Config
) => {
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

    console.log(filename);

    const data = await (<ExportMixin>node).exportAsync({ format: "PNG" });
    assets.push({ filename, data });
  });

  return assets;
};

const refreshUI = async (config?: Config) => {
  const exportables = getExportables();

  let example: string[] = [];
  if (config) {
    const assets = await getAssets(exportables, config);
    example = assets.map((a) => a.filename);
  }

  figma.ui.postMessage({
    type: "refresh",
    nodeCount: exportables.length,
    example,
  });
};

figma.on("selectionchange", () => {
  refreshUI();
});

figma.ui.onmessage = async (message) => {
  const type = message.type;

  if (type === "init") {
    refreshUI();
  } else if (type === "config") {
    refreshUI({
      format: message.format,
      connector: message.connector,
      casing: message.casing,
    });
  } else if (type === "export") {
    const exportables = getExportables();
    const assets = await getAssets(exportables, {
      format: message.format,
      connector: message.connector,
      casing: message.casing,
    });
    figma.ui.postMessage({ type: "export", assets });
  } else if (type === "cancel") {
    figma.closePlugin();
  }
};
