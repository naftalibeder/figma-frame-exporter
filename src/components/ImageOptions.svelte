<script lang="ts" type="module">
  import {
    Section,
    SelectMenu,
    Input,
    type SelectMenuItem,
  } from "figma-svelte-components";
  import { Extension, ImageConfig } from "../types";

  export let imageConfig: ImageConfig;
  export let onChange: (iomageConfig: ImageConfig) => void;

  const extensionOptions: SelectMenuItem<Extension>[] = [
    { id: "PNG", title: "PNG" },
    { id: "JPG", title: "JPG" },
    { id: "SVG", title: "SVG" },
    { id: "PDF", title: "PDF" },
  ];

  const _onChangeConfig = () => {
    onChange(imageConfig);
  };
</script>

<div class="grid grid-cols-2 gap-2">
  <div class="grid grid-rows-2">
    <Section>Image size</Section>
    <Input
      type="text"
      placeholder="E.g. 2x, 64w, 200h"
      disabled={!imageConfig.extension || imageConfig.extension === "SVG"}
      bind:value={imageConfig.sizeConstraint}
      on:input={(e) => {
        imageConfig.sizeConstraint = e.target["value"];
        _onChangeConfig();
      }}
    />
  </div>
  <div class="grid grid-rows-2">
    <Section>File type</Section>
    <SelectMenu
      items={extensionOptions}
      selectedItemId={imageConfig.extension}
      placeholder={"Choose one"}
      onChangeSelectedItem={(itemId) => {
        imageConfig.extension = itemId;
        _onChangeConfig();
      }}
    />
  </div>
</div>
