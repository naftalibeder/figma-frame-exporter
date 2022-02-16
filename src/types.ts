export type Casing = "lower" | "upper" | "title";

export interface Config {
  format: string;
  connector: string;
  casing: Casing;
}

export interface Variant {
  property: string;
  value: string;
}

export interface Exportable {
  id: string;
  parentName: string;
  variants: Variant[];
}

export interface Asset {
  filename: string;
  data: Uint8Array;
}

export default {};
