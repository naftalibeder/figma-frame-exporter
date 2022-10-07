<script lang="ts" type="module">
  import { Section, SelectMenu, Input, Type } from "figma-plugin-ds-svelte";
  import { toSentenceCase } from "js-convert-case";
  import { CasingOption, casingStrings, NameConfig } from "types";
  import { casingMap } from "utils";

  export let nameConfig: NameConfig;
  export let onChange: (_nameConfig: NameConfig) => void;

  let casingOptions: CasingOption[] = casingStrings.map((c) => {
    const example = casingMap[c]("the quick brown fox");
    const label = `${toSentenceCase(c)} (${example})`;
    return {
      value: c,
      label,
      group: null,
      selected: false,
    };
  });
  $: {
    casingOptions.forEach((o, i) => {
      casingOptions[i].selected = o.value === nameConfig.casing;
    });
  }

  const _onChangeConfig = () => {
    onChange(nameConfig);
  };
</script>

<div>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col">
      <Section>File names</Section>
      <div class="section-subtitle">
        <Type>Choose the content, connectors, and format for the names of the exported files.</Type>
      </div>
    </div>

    <Input
      placeholder="Enter a syntax"
      bind:value={nameConfig.syntax}
      on:input={(e) => {
        nameConfig.syntax = e.target["value"];
        _onChangeConfig();
      }}
    />

    <SelectMenu
      bind:menuItems={casingOptions}
      on:change={(e) => {
        nameConfig.casing = e.detail.value;
        _onChangeConfig();
      }}
    />

    <div class="flex flex-1 flex-row gap-2">
      <Input
        placeholder="Before"
        bind:value={nameConfig.connectors.before}
        on:input={(e) => {
          nameConfig.connectors.before = e.target["value"];
          _onChangeConfig();
        }}
      />
      <Input
        placeholder="Between"
        bind:value={nameConfig.connectors.between}
        on:input={(e) => {
          nameConfig.connectors.between = e.target["value"];
          _onChangeConfig();
        }}
      />
      <Input
        placeholder="After"
        bind:value={nameConfig.connectors.after}
        on:input={(e) => {
          nameConfig.connectors.after = e.target["value"];
          _onChangeConfig();
        }}
      />
    </div>
  </div>
</div>
