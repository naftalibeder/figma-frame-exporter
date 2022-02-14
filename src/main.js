figma.showUI(__html__);
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
const getAssets = async (exportables) => {
    let assets = [];
    exportables.forEach(async (exportable) => {
        const node = figma.getNodeById(exportable.id);
        const settings = {
            suffix: `${exportable.parentName}.${exportable.variantValue}`,
            format: "PNG",
        };
        const data = await node.exportAsync(settings);
        assets.push({
            filename: `${exportable.parentName}.${exportable.variantValue}`,
            data,
        });
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
    else if (type === "export") {
        const exportables = getExportables();
        const assets = await getAssets(exportables);
        figma.ui.postMessage({ type: "export", assets });
    }
    else if (type === "cancel") {
        figma.closePlugin();
    }
};
