<script lang="ts" type="module">
  import { Section, SelectMenu, Input } from "figma-plugin-ds-svelte";
  import convertCase from "../../node_modules/js-convert-case/lib/index";
  import {
    Casing,
    CasingOption,
    casingStrings,
    Extension,
    ExtensionOption,
    NameConfig,
  } from "types";

  export let nameConfig: NameConfig;
  export let onChangeNameConfig: (_nameConfig: NameConfig) => void;

  let casingOptions: CasingOption[] = casingStrings.map((s) => {
    return {
      value: s,
      label: convertCase.toSentenceCase(s),
      group: null,
      selected: false,
    };
  });
  $: {
    casingOptions.forEach((o, i) => {
      casingOptions[i].selected = o.value === nameConfig.casing;
    });
  }

  let extensionOptions: ExtensionOption[] = [
    { value: "PNG", label: "PNG", group: null, selected: false },
    { value: "JPG", label: "JPG", group: null, selected: false },
    { value: "SVG", label: "SVG", group: null, selected: false },
    { value: "PDF", label: "PDF", group: null, selected: false },
  ];
  $: {
    extensionOptions.forEach((o, i) => {
      extensionOptions[i].selected = o.value === nameConfig.extension;
    });
  }

  const _onChangeConfig = () => {
    onChangeNameConfig(nameConfig);
  };
</script>

<div class="flex flex-1 flex-col">
  <div>
    <Section>File name</Section>
    <Input
      type="text"
      placeholder="Enter a syntax"
      bind:value={nameConfig.syntax}
      on:input={(e) => {
        nameConfig.syntax = e.target["value"];
        _onChangeConfig();
      }}
    />
  </div>

  <div class="flex flex-row gap-2">
    <div class="flex flex-1 flex-col">
      <Section>Connector</Section>
      <Input
        type="text"
        placeholder="Enter a connector mark"
        bind:value={nameConfig.connector}
        on:input={(e) => {
          nameConfig.connector = e.target["value"];
          _onChangeConfig();
        }}
      />
    </div>
    <div class="flex flex-1 flex-col">
      <Section>Capitalization</Section>
      <SelectMenu
        bind:menuItems={casingOptions}
        on:change={(e) => {
          nameConfig.casing = e.detail.value;
          _onChangeConfig();
        }}
      />
    </div>
  </div>

  <div class="flex flex-row gap-2">
    <div class="flex flex-1 flex-col">
      <Section>Size</Section>
      <Input
        type="text"
        placeholder="E.g. 2x, 64w, 200h"
        disabled={!nameConfig.extension || nameConfig.extension === "SVG"}
        bind:value={nameConfig.sizeConstraint}
        on:input={(e) => {
          nameConfig.sizeConstraint = e.target["value"];
          _onChangeConfig();
        }}
      />
    </div>
    <div class="flex flex-1 flex-col">
      <Section>Format</Section>
      <SelectMenu
        bind:menuItems={extensionOptions}
        on:change={(e) => {
          nameConfig.extension = e.detail.value;
          _onChangeConfig();
        }}
      />
    </div>
  </div>
</div>
