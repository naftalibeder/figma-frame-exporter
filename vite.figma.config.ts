import { PluginOption, defineConfig } from "vite";

export function polyfillCode(): PluginOption {
  return {
    name: "polyfillCode",
    config: undefined,
    enforce: "post",
    generateBundle: (_, bundle) => {
      console.log("");

      for (const [k, v] of Object.entries(bundle)) {
        if (k.endsWith(".js") && v.type === "chunk") {
          console.log("JS:", v.fileName);

          v.code = v.code.replace("??", "||");
        }
      }

      console.log("Polyfilled JS code");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "main.ts",
      name: "main",
      fileName: "main",
      formats: ["es"],
    },
    emptyOutDir: false,
  },
  plugins: [polyfillCode()],
});
