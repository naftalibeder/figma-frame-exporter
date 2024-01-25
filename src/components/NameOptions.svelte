<script lang="ts" type="module">
  import { toSentenceCase } from "js-convert-case";
  import {
    Section,
    SelectMenu,
    Input,
    type SelectMenuItem,
  } from "figma-svelte-components";
  import { Casing, casingStrings, NameConfig } from "../types";
  import { casingMap } from "../utils";
  import { Tag } from ".";

  export let nameConfig: NameConfig;
  export let onChange: (_nameConfig: NameConfig) => void;

  const syntaxVars = [
    ["$F", "+ Frame name"],
    ["$V", "+ Variant names"],
  ];

  let lastSyntaxCursorIndex = 0;

  let casingOptions: SelectMenuItem<Casing>[] = casingStrings.map((c) => {
    const example = casingMap[c]("quick brown fox");
    return {
      id: c,
      title: toSentenceCase(c),
      subtitle: example,
    };
  });

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
      <div class="flex flex-row items-center flex-wrap cursor-pointer">
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

    <div class="grid grid-cols-2 gap-2">
      <div class="grid grid-rows-2">
        <Section>Case</Section>
        <SelectMenu
          items={casingOptions}
          selectedItemId={nameConfig.casing}
          placeholder={"Select one"}
          onChangeSelectedItem={(itemId) => {
            nameConfig.casing = itemId;
            _onChangeConfig();
          }}
        />
      </div>
      <div class="grid grid-rows-2">
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
