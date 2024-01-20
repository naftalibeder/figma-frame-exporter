<script lang="ts" type="module">
  import { Section, SelectMenu, Input } from "figma-plugin-ds-svelte";
  import { ExtensionOption, ImageConfig } from "../types";

  export let imageConfig: ImageConfig;
  export let onChange: (iomageConfig: ImageConfig) => void;

  let extensionOptions: ExtensionOption[] = [
    { value: "PNG", label: "PNG", group: null, selected: false },
    { value: "JPG", label: "JPG", group: null, selected: false },
    { value: "SVG", label: "SVG", group: null, selected: false },
    { value: "PDF", label: "PDF", group: null, selected: false },
  ];
  $: {
    extensionOptions.forEach((o, i) => {
      extensionOptions[i].selected = o.value === imageConfig.extension;
    });
  }

  const _onChangeConfig = () => {
    onChange(imageConfig);
  };
</script>

<div class="flex flex-col">
  <div class="flex flex-row gap-2">
    <div class="flex flex-col">
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
    <div class="flex flex-col">
      <Section>File type</Section>
      <SelectMenu
        bind:menuItems={extensionOptions}
        on:change={(e) => {
          imageConfig.extension = e.detail.value;
          _onChangeConfig();
        }}
      />
    </div>
  </div>
</div>
