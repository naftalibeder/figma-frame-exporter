figma.showUI(__html__);

const buildMap = () => {
  const nodes = figma.currentPage.selection;

  for (const node of nodes) {
    if (node.type === "COMPONENT_SET") {
      const variants = node.children;
      for (const variant of variants) {
        const [property, value] = variant.name.split("=");
        console.log("set:", node.name, property, value);
      }
    } else {
      console.log("other:", node.name);
    }
  }
};

figma.ui.onmessage = (msg) => {
  if (msg.type === "init") {
    buildMap();
  } else if (msg.type === "export") {
    figma.closePlugin();
  } else if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
