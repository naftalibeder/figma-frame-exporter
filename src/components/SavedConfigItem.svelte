<script lang="ts" type="module">
  import { Type, Icon, Input, IconCheck, IconMinus } from "figma-plugin-ds-svelte";
  import { toSentenceCase } from "js-convert-case";
  import { Config } from "types";

  export let config: Config;
  export let onChangeConfigName: (name: string) => void;
  export let onSelectDuplicate: () => void;
  export let onSelectDelete: () => void;

  let isEditingName = false;

  let descriptionTags: string[] = [];
  $: {
    const parts = [
      config.extension,
      `${toSentenceCase(config.casing)} casing`,
      `${config.syntax}`,
      config.sizeConstraint,
    ];

    if (config.layerMods.length > 0) {
      const plural = config.layerMods.length === 1 ? "" : "s";
      parts.push(`${config.layerMods.length} modification${plural}`);
    }

    if (config.connectors.before !== "") {
      parts.push(`Prefix ${config.connectors.before}`);
    }

    if (config.connectors.after !== "") {
      parts.push(`Suffix ${config.connectors.after}`);
    }

    descriptionTags = parts;
  }
</script>

<div class="flex flex-row space-x-2">
  <div class="flex flex-1 flex-col gap-1">
    <div class="flex flex-1 flex-col gap-2">
      {#if !isEditingName}
        <Type>
          <div
            class={"cursor-pointer " + (config.name.length === 0 ? "text-gray-400" : "")}
            on:click={() => {
              isEditingName = true;
            }}
          >
            {config.name.length === 0 ? "Click to edit name" : config.name}
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
          on:blur={() => {
            isEditingName = false;
          }}
        />
      {/if}
      <div class="flex flex-row items-center flex-wrap">
        {#each descriptionTags as tag}
          <div
            class="flex h-fit px-1 py-0.5 mt-2 mr-2 outline outline-1 outline-black rounded-md whitespace-nowrap"
          >
            <Type>{tag}</Type>
          </div>
        {/each}
      </div>
      <div class="flex flex-row space-x-2">
        <Type>
          <div class={"flex w-fit text-gray-400 cursor-pointer"} on:click={onSelectDuplicate}>
            Duplicate
          </div>
        </Type>
      </div>
    </div>
  </div>
  <div class="flex items-start" on:click={onSelectDelete}>
    <div class="flex rounded-md hover:bg-gray-100">
      <Icon iconName={IconMinus} />
    </div>
  </div>
</div>
