import { Casing } from "./types";

export const cased = (value: string, casing: Casing): string => {
  if (casing === "lower") {
    return value.toLowerCase();
  } else if (casing === "upper") {
    return value.toUpperCase();
  } else if (casing === "title") {
    return value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
  }
};
