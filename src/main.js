figma.showUI(__html__, { width: 280, height: 240 });
const getExportables = () => {
    const nodes = figma.currentPage.selection;
    const exportables = [];
    for (const node of nodes) {
        if (node.type === "COMPONENT_SET") {
            const variants = node.children;
            for (const variant of variants) {
                const [property, value] = variant.name.split("=");
                exportables.push({
                    id: variant.id,
                    parentName: node.name,
                    variantProperty: property,
                    variantValue: value,
                });
            }
        }
        else {
            exportables.push({
                id: node.id,
                parentName: node.name,
            });
        }
    }
    return exportables;
};
const replacingFormatStr = (filename, match, replacement) => {
    const re = new RegExp(`{(.?)${match}}`);
    if (replacement) {
        filename = filename.replace(re, `$1${replacement}`);
    }
    else {
        filename = filename.replace(re, "");
    }
    return filename;
};
const getAssets = async (exportables, format) => {
    let assets = [];
    exportables.forEach(async (exportable) => {
        const node = figma.getNodeById(exportable.id);
        let filename = format;
        filename = replacingFormatStr(filename, "f", exportable.parentName);
        filename = replacingFormatStr(filename, "p", exportable.variantProperty);
        filename = replacingFormatStr(filename, "v", exportable.variantValue);
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
        const assets = await getAssets(exportables, message.format);
        figma.ui.postMessage({ type: "export", assets });
    }
    else if (type === "cancel") {
        figma.closePlugin();
    }
};
