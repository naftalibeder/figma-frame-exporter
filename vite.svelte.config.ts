import { PluginOption, defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { JSDOM } from "jsdom";

export function generateUI(): PluginOption {
  return {
    name: "generateUI",
    config: undefined,
    enforce: "post",
    generateBundle: (_, bundle) => {
      console.log("");

      let jsFileName: string | undefined;
      let jsSrc: string | undefined;
      let cssFileName: string | undefined;
      let cssSrc: string | undefined;

      for (const [k, v] of Object.entries(bundle)) {
        if (k.endsWith(".js") && v.type === "chunk") {
          console.log("JS:", v.fileName);

          jsFileName = v.fileName;
          jsSrc = v.code;
          delete bundle[k];
        }

        if (k.endsWith(".css") && v.type === "asset") {
          console.log("CSS:", v.fileName);

          cssFileName = v.fileName;
          cssSrc = `${v.source}`;
          delete bundle[k];
        }
      }

      if (!jsFileName || !jsSrc) {
        throw new Error("Input JS file not found");
      }

      if (!cssFileName || !cssSrc) {
        throw new Error("Input CSS file not found");
      }

      for (const [k, v] of Object.entries(bundle)) {
        if (k.endsWith(".html") && v.type === "asset") {
          console.log("HTML:", v.fileName);

          const dom = new JSDOM(v.source);
          const doc = dom.window.document;

          const jsElem = doc.querySelector(`script[src*="${jsFileName}"]`);
          if (!jsElem) {
            throw new Error("Input HTML file does not contain a script tag");
          }
          jsElem.remove();
          const jsElemNew = doc.createElement("script");
          jsElemNew.innerHTML = jsSrc;
          doc.body.appendChild(jsElemNew);

          const cssElem = doc.querySelector(`link[href*="${cssFileName}"]`);
          if (!cssElem) {
            throw new Error("Input HTML file does not contain a script tag");
          }
          cssElem.remove();
          const cssElemNew = doc.createElement("style");
          cssElemNew.innerHTML = cssSrc;
          doc.head.appendChild(cssElemNew);

          v.source = dom.serialize();
        }
      }

      console.log("Bundled JS and CSS into HTML file");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
  },
  plugins: [svelte(), generateUI()],
});
