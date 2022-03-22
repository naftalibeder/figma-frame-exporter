import { Casing, Size, ConstraintType } from "./types";

export const cased = (value: string, casing: Casing): string => {
  if (casing === "lower") {
    return value.toLowerCase();
  } else if (casing === "upper") {
    return value.toUpperCase();
  } else if (casing === "title") {
    return value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
  }
};

type SizeConstraintType = {
  constraint?: ExportSettingsConstraints;
  destSize: Size;
};

export const sizeContraint = (
  constraint: string,
  srcSize: Size
): SizeConstraintType => {
  if (constraint.endsWith("x")) {
    const value = Number(constraint.slice(0, -1));
    return {
      constraint: { type: "SCALE", value },
      destSize: {
        width: srcSize.width * value,
        height: srcSize.height * value,
      },
    };
  } else if (constraint.endsWith("w")) {
    const value = Number(constraint.slice(0, -1));
    return {
      constraint: { type: 'WIDTH', value },
      destSize: {
        width: value,
        height: srcSize.height * (value / srcSize.width),
      },
    };
  } else if (constraint.endsWith("h")) {
    const value = Number(constraint.slice(0, -1));
    return {
      constraint: { type: 'HEIGHT', value },
      destSize: {
        width: srcSize.width * (value / srcSize.height),
        height: value,
      },
    };
  } else {
    return {
      destSize: srcSize,
    };
  }
};

export const log = (...args: any[]) => {
  console.log(...args);
};
