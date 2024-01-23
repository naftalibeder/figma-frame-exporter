export type Store = {
  selectedConfigId: string;
  configs: Record<string, Config>;
};

export type Page = "configure" | "saved" | "about";

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
export type Casing = (typeof casingStrings)[number];

export type Extension = "PNG" | "JPG" | "SVG" | "PDF";
export type ConstraintType = "SCALE" | "WIDTH" | "HEIGHT";

export const layerProperties = [
  "visible",
  "opacity",
  "x",
  "y",
  "rotation",
  "cornerRadius",
  "strokeWeight",
] as const;
export type LayerProperty = (typeof layerProperties)[number];

export type ConfigId = string;

export interface Config extends NameConfig, ImageConfig, LayerModConfig {
  id: ConfigId;
  name: string;
  index: number;
}

export interface NameConfig {
  syntax: string;
  casing: Casing;
  connector: string;
}

export interface ImageConfig {
  sizeConstraint: string;
  extension: Extension;
}

export interface LayerModConfig {
  layerMods: LayerMod[];
}

export interface Size {
  width: number;
  height: number;
}

export interface LayerMod {
  id: string;
  query?: string;
  property?: LayerProperty;
  value?: any;
}

export interface VariantInstance {
  type: "text" | "boolean";
  property: string;
  value: string;
}

export interface Exportable {
  id: string;
  parentName: string;
  variants: VariantInstance[];
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
  limitCt?: number;
}

export type LayerModMatches = Record<string, number>;

export interface ExportPayload {
  nodeCount: number;
  layerModMatches: LayerModMatches;
  assets: Asset[];
}

export default {};
