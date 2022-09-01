<script lang="ts" type="module">
  import { Type, Section, Icon, IconPlus } from "figma-plugin-ds-svelte";
  import { LayerMod } from "types";
  import Divider from "./Divider.svelte";
  import LayerOptionItem from "./LayerOptionItem.svelte";

  export let layerMods: LayerMod[];
  export let onChangeLayerMods: (mods: LayerMod[]) => void;
</script>

<div>
  <div class="flex flex-row gap-2 justify-between">
    <div class="flex flex-col">
      <Section>Modify layers</Section>
      <div class="section-subtitle">
        <Type>Modify the exported version of any layer.</Type>
      </div>
    </div>
    <div
      class="flex items-start"
      on:click={() => {
        const mods = [...layerMods];
        mods.push({});
        onChangeLayerMods(mods);
      }}
    >
      <div class="flex rounded-md hover:bg-gray-100">
        <Icon iconName={IconPlus} />
      </div>
    </div>
  </div>
  <div class="scroll-box rounded-box gap-2 h-[206] mt-2 py-2">
    {#each layerMods as _, index}
      {#if index > 0}
        <Divider />
      {/if}

      <LayerOptionItem
        layerMod={layerMods[index]}
        onChange={(mod) => {
          const mods = [...layerMods];
          mods[index] = mod;
          onChangeLayerMods(mods);
        }}
        onSelectDelete={() => {
          if (layerMods.length > 1) {
            const mods = [...layerMods];
            mods.splice(index, 1);
            onChangeLayerMods(mods);
          }
        }}
      />
    {/each}
  </div>
</div>
