<script lang="ts" type="module">
  import { Section, SelectMenu, Input } from "figma-plugin-ds-svelte";
  import convertCase from "../../node_modules/js-convert-case/lib/index";
  import { CasingOption, casingStrings, NameConfig } from "types";

  export let nameConfig: NameConfig;
  export let hasVariants: boolean;
  export let onChange: (_nameConfig: NameConfig) => void;

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

  const _onChangeConfig = () => {
    onChange(nameConfig);
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
      <Section>Frame name format</Section>
      <SelectMenu
        bind:menuItems={casingOptions}
        on:change={(e) => {
          nameConfig.casing = e.detail.value;
          _onChangeConfig();
        }}
      />
    </div>
    <div class="flex flex-1 flex-col">
      <Section>Variants connector</Section>
      <div class="flex flex-1 flex-row">
        <Input
          type="text"
          placeholder="Before"
          disabled={!hasVariants}
          bind:value={nameConfig.connectors.before}
          on:input={(e) => {
            nameConfig.connectors.before = e.target["value"];
            _onChangeConfig();
          }}
        />
        <Input
          type="text"
          placeholder="Between"
          disabled={!hasVariants}
          bind:value={nameConfig.connectors.between}
          on:input={(e) => {
            nameConfig.connectors.between = e.target["value"];
            _onChangeConfig();
          }}
        />
        <Input
          type="text"
          placeholder="After"
          disabled={!hasVariants}
          bind:value={nameConfig.connectors.after}
          on:input={(e) => {
            nameConfig.connectors.after = e.target["value"];
            _onChangeConfig();
          }}
        />
      </div>
    </div>
  </div>
</div>
