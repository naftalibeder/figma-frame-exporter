export type Casing = "lower" | "upper" | "title";

export interface Config {
  format: string;
  connector: string;
  casing: Casing;
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
  data: Uint8Array;
  size: Size;
}

export interface AssetInfo {
  filename: string;
  size: Size;
}

export default {};
