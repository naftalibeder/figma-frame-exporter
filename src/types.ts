export const casingStrings = [
  "original",
  "lower",
  "upper",
  "title",
  "snake",
  "kebab",
  "camel",
  "pascal",
  "dot",
] as const;
export type Casing = typeof casingStrings[number];

export type Extension = "PNG" | "JPG" | "SVG" | "PDF";
export type ConstraintType = "SCALE" | "WIDTH" | "HEIGHT";

export interface Config extends NameConfig {
  layerMods: LayerMod[];
}

export interface NameConfig {
  syntax: string;
  connector: string;
  casing: Casing;
  sizeConstraint: string;
  extension: Extension;
}

export interface CasingOption {
  value: Casing;
  label: string;
  group: string | null;
  selected: boolean;
}

export interface ExtensionOption {
  value: Extension;
  label: string;
  group: string | null;
  selected: boolean;
}

export interface Size {
  width: number;
  height: number;
}

export interface LayerMod {
  query?: string;
  property?: "cornerRadius" | "visible";
  value?: any;
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
