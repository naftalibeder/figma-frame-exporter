import convertCase from "../node_modules/js-convert-case/lib/index";

import { Casing, Config, Extension, Size } from "./types";

export const randomId = () => `${Math.floor(Math.random() * 1000)}`;

const caseMap: Record<Casing, (s: string) => string> = {
  original: (s) => s,
  lower: convertCase.toLowerCase,
  upper: convertCase.toUpperCase,
  title: convertCase.toHeaderCase,
  snake: convertCase.toSnakeCase,
  kebab: convertCase.toKebabCase,
  camel: convertCase.toCamelCase,
  pascal: convertCase.toPascalCase,
  dot: convertCase.toDotCase,
};

export const withCasing = (value: string, casing: Casing): string => {
  const values = value
    .split("/")
    .map((o) => caseMap[casing](o.trim()))
    .join("/");
  return values;
};

export const buildExportSettings = (config: {
  extension: Extension;
  constraint: string;
  srcSize: Size;
}): { settings: ExportSettings; destSize?: Size } => {
  const { extension, constraint, srcSize } = config;

  if (extension === "SVG" || extension === "PDF") {
    return {
      settings: {
        format: extension,
      },
    };
  } else {
    if (constraint.endsWith("x")) {
      const value = Number(constraint.slice(0, -1));
      return {
        settings: {
          format: extension,
          constraint: { type: "SCALE", value },
          useAbsoluteBounds: true,
        },
        destSize: {
          width: srcSize.width * value,
          height: srcSize.height * value,
        },
      };
    } else if (constraint.endsWith("w")) {
      const value = Number(constraint.slice(0, -1));
      return {
        settings: {
          format: extension,
          constraint: { type: "WIDTH", value },
        },
        destSize: {
          width: value,
          height: srcSize.height * (value / srcSize.width),
        },
      };
    } else if (constraint.endsWith("h")) {
      const value = Number(constraint.slice(0, -1));
      return {
        settings: {
          format: extension,
          constraint: { type: "HEIGHT", value },
        },
        destSize: {
          width: srcSize.width * (value / srcSize.height),
          height: value,
        },
      };
    } else {
      return {
        settings: {
          format: extension,
        },
        destSize: srcSize,
      };
    }
  }
};

export const buildDefaultConfig = (): Config => {
  return {
    id: `${Math.random()}`,
    name: "",
    syntax: "$F$V",
    connectors: {
      before: "",
      between: "",
      after: "",
    },
    casing: "original",
    sizeConstraint: "2x",
    extension: "PNG",
    layerMods: [
      // {
      //   id: `${Math.random()}`,
      //   query: undefined,
      //   property: undefined,
      //   value: undefined,
      // },
    ],
  };
};

export const delay = async (ms: number) => await new Promise((res) => setTimeout(res, ms));

export const log = (...args: any[]) => {
  console.log("[Frame Exporter]", ...args);
};

export default {};
