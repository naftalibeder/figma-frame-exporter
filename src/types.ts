export type Casing = "lower" | "upper" | "title";

export type Extension = "PNG" | "JPG" | "SVG";

export interface Config {
  syntax: string;
  connector: string;
  casing: Casing;
  sizeConstraint: string;
  extension: Extension;
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
  data: Uint8Array;
  size: Size;
}

export interface AssetInfo {
  filename: string;
  extension: Extension;
  size: Size;
}

export default {};
