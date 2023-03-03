<script lang="ts" type="module">
  import { Section, SelectMenu, Input } from "figma-plugin-ds-svelte";
  import { toSentenceCase } from "js-convert-case";
  import { CasingOption, casingStrings, NameConfig } from "types";
  import { casingMap } from "utils";
  import Tag from "./Tag.svelte";

  export let nameConfig: NameConfig;
  export let onChange: (_nameConfig: NameConfig) => void;

  const syntaxVars = [
    ["$F", "Frame name"],
    ["$V", "Variant names"],
  ];

  let lastSyntaxCursorIndex = 0;

  let casingOptions: CasingOption[] = casingStrings.map((c) => {
    const example = casingMap[c]("quick brown fox");
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
      <Section>File name</Section>
      <Input
        placeholder="Enter a syntax"
        bind:value={nameConfig.syntax}
        on:input={(e) => {
          nameConfig.syntax = e.target["value"];
          _onChangeConfig();
        }}
        on:keyup={(e) => {
          lastSyntaxCursorIndex = e.target["selectionStart"];
        }}
        on:mouseup={(e) => {
          lastSyntaxCursorIndex = e.target["selectionStart"];
        }}
      />
      <div class="flex flex-row items-center flex-wrap px-2 cursor-pointer">
        {#each syntaxVars as [slug, display]}
          <div
            on:click={() => {
              const s = nameConfig.syntax;
              const i = lastSyntaxCursorIndex;
              nameConfig.syntax = `${s.slice(0, i)}${slug}${s.slice(i)}`;
              _onChangeConfig();
            }}
          >
            <Tag>{display}</Tag>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex flex-row gap-2">
        <div class="flex flex-col">
          <Section>Case</Section>
          <SelectMenu
            bind:menuItems={casingOptions}
            on:change={(e) => {
              nameConfig.casing = e.detail.value;
              _onChangeConfig();
            }}
          />
        </div>
        <div class="flex flex-col">
          <Section>Join variants</Section>
          <Input
            placeholder="E.g. -"
            bind:value={nameConfig.connector}
            on:input={(e) => {
              nameConfig.connector = e.target["value"];
              _onChangeConfig();
            }}
          />
        </div>
      </div>
    </div>
  </div>
</div>
