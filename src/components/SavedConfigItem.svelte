<script lang="ts" type="module">
  import { Type, Icon, Input, IconCheck } from "figma-plugin-ds-svelte";
  import { toSentenceCase } from "js-convert-case";
  import { Config } from "types";

  export let config: Config;
  export let isSelected: boolean;
  export let isSoleItem: boolean;
  export let onSelect: () => void;
  export let onChangeConfigName: (name: string) => void;
  export let onSelectDelete: () => void;

  let isEditingName = false;
</script>

<div class="flex flex-row items-center py-2 cursor-pointer" on:click={onSelect}>
  <div class="flex flex-1 flex-col gap-2">
    {#if !isEditingName}
      <Type>
        <div
          class={"py-2 " + (config.name.length === 0 ? "text-gray-400" : "")}
          on:click={() => {
            isEditingName = true;
          }}
        >
          {config.name.length === 0
            ? `${toSentenceCase(config.casing)} casing at ${config.sizeConstraint} with ${
                config.layerMods.length
              } modification${config.layerMods.length === 1 ? "" : "s"}`
            : config.name}
        </div>
      </Type>
    {:else}
      <Input
        bind:value={config.name}
        placeholder="Custom name"
        on:change={(e) => {
          const name = e.target["value"];
          onChangeConfigName(name.trim());
          isEditingName = false;
        }}
        on:blur={(e) => {
          isEditingName = false;
        }}
      />
    {/if}
    <Type>
      <div class="flex w-fit text-gray-400 hover:text-red-500" on:click={onSelectDelete}>
        {isSoleItem ? "Reset" : "Delete"}
      </div>
    </Type>
  </div>
  {#if isSelected}
    <Icon iconName={IconCheck} />
  {/if}
</div>
