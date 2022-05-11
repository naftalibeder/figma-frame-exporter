import convertCase from "../node_modules/js-convert-case/lib/index";

import { Casing, Extension, Size } from "./types";

export const withCasing = (value: string, casing: Casing): string => {
  const _convert = (v: string) => {
    switch (casing) {
      case "lower":
        return convertCase.toLowerCase(v);
      case "upper":
        return convertCase.toUpperCase(v);
      case "title":
        return convertCase.toHeaderCase(v);
      case 'snake':
        return convertCase.toSnakeCase(v);
      case 'kebab':
        return convertCase.toKebabCase(v);
      case 'camel':
        return convertCase.toCamelCase(v);
      case 'pascal':
        return convertCase.toPascalCase(v);
      case 'dot':
        return convertCase.toDotCase(v);
      default:
        return v;
    }
  }

  const values = value.split('/').map(o => _convert(o.trim())).join(' / ');
  return values;
};

export const buildExportSettings = (config: {
  extension: Extension,
  constraint: string,
  srcSize: Size
}): { settings: ExportSettings; destSize?: Size } => {
  const {
    extension,
    constraint,
    srcSize,
  } = config;

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

export const log = (...args: any[]) => {
  console.log('[Frame Exporter]', ...args);
};

export default {};
