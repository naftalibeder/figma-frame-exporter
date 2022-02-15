figma.showUI(__html__, { width: 300, height: 400 });
const getExportables = () => {
    const nodes = figma.currentPage.selection;
    const exportables = [];
    for (const node of nodes) {
        if (node.type === "COMPONENT_SET") {
            const children = node.children;
            for (const child of children) {
                const pairs = child.name.split(", ");
                let variants = [];
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
        }
        else {
            exportables.push({
                id: node.id,
                parentName: node.name,
                variants: [],
            });
        }
    }
    return exportables;
};
const cased = (value, casing) => {
    if (casing === "lower") {
        return value.toLowerCase();
    }
    else if (casing === "upper") {
        return value.toUpperCase();
    }
    else if (casing === "title") {
        return value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
    }
};
const getAssets = async (exportables, format, connector, casing) => {
    let assets = [];
    exportables.forEach(async (exportable) => {
        const node = figma.getNodeById(exportable.id);
        let variantsStr = "";
        exportable.variants.forEach((variant) => {
            const value = cased(variant.value, casing);
            variantsStr += `${connector}${value}`;
        });
        let filename = format
            .replace("{f}", cased(exportable.parentName, casing))
            .replace("{v}", variantsStr);
        console.log(filename);
        const data = await node.exportAsync({ format: "PNG" });
        assets.push({ filename, data });
    });
    return assets;
};
figma.on("selectionchange", () => {
    const exportables = getExportables();
    figma.ui.postMessage({ type: "nodes", count: exportables.length });
});
figma.ui.onmessage = async (message) => {
    const type = message.type;
    if (type === "init") {
        const exportables = getExportables();
        figma.ui.postMessage({ type: "nodes", count: exportables.length });
    }
    else if (type === "format") {
        // TODO
    }
    else if (type === "export") {
        const exportables = getExportables();
        const assets = await getAssets(exportables, message.format, message.connector, message.casing);
        figma.ui.postMessage({ type: "export", assets });
    }
    else if (type === "cancel") {
        figma.closePlugin();
    }
};
