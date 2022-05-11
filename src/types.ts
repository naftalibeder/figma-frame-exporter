export const casingStrings = ["original", "lower", "upper", "title", "snake", "kebab", "camel", "pascal", "dot"] as const;

export type Casing = typeof casingStrings[number];
export type Extension = "PNG" | "JPG" | "SVG" | "PDF";
export type ConstraintType = "SCALE" | "WIDTH" | "HEIGHT";

export interface Config {
  syntax: string;
  connector: string;
  casing: Casing;
  sizeConstraint: string;
  extension: Extension;
  hideNodes: string[];
}

export interface Size {
  width: number;
  height: number;
}

export interface Variant {
  property: string;
  value: string;
}

export interface Exportable {
  id: string;
  parentName: string;
  variants: Variant[];
  size: Size;
}

export interface Asset {
  filename: string;
  extension: Extension;
  size?: Size;
  data: Uint8Array;
  url?: string;
}

export interface PreviewSettings {
  isFinal: boolean;
  thumbSize?: Size;
}

export default {};
