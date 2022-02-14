import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import svg from "rollup-plugin-svg";
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import htmlBundle from "rollup-plugin-html-bundle";

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: "app.js",
    output: {
      format: "iife",
      name: "ui",
      file: "public/build/bundle.js",
    },
    plugins: [
      svelte({
        dev: !production,
        preprocess: sveltePreprocess({
          sourceMap: !production,
        }),
        compilerOptions: {
          dev: !production,
        },
      }),
      resolve({
        browser: true,
        dedupe: (importee) =>
          importee === "svelte" || importee.startsWith("svelte/"),
        extensions: [".svelte", ".mjs", ".js", ".json", ".node"],
      }),
      commonjs(),
      svg(),
      htmlBundle({
        template: "src/index.html",
        target: "public/index.html",
        inline: true,
      }),
      !production && serve(),
      !production && livereload("public"),
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
  {
    input: "src/main.ts",
    output: {
      file: "public/main.js",
      format: "cjs",
      name: "main",
    },
    plugins: [typescript(), commonjs(), production && terser()],
  },
];

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}
