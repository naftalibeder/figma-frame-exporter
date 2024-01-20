<script lang="ts" type="module">
  import { Type, Section, IconPlus } from "figma-plugin-ds-svelte";
  import { LayerMod, LayerModMatches } from "../types";
  import { randomId } from "../utils";
  import LayerModItem from "./LayerModItem.svelte";
  import IconButton from "./IconButton.svelte";
  import Divider from "./Divider.svelte";

  export let layerMods: LayerMod[];
  export let layerModMatches: LayerModMatches;
  export let onChangeLayerMods: (mods: LayerMod[]) => void;
</script>

<div>
  <div class="flex flex-row gap-2 justify-between">
    <div class="flex flex-col">
      <Section>Layer modifiers</Section>
      <div class="section-subtitle">
        <Type
          >Modify the exported version of any layer. Match text is evaluated as
          a <a href="https://regex101.com/r/S9wWyf/1" target="_blank"
            >regular expression</a
          >.</Type
        >
      </div>
    </div>
    <IconButton
      iconName={IconPlus}
      onClick={() => {
        const mods = [...layerMods];
        mods.push({ id: randomId() });
        onChangeLayerMods(mods);
      }}
    />
  </div>
  {#if layerMods.length > 0}
    <div class="space-y-4 mt-4">
      {#each layerMods as layerMod, index}
        {#if index > 0}
          <div class="px-2">
            <Divider />
          </div>
        {/if}

        <div class="pl-2">
          <LayerModItem
            {layerMod}
            matchedNodeCount={layerModMatches[layerMod.id] ?? 0}
            onChange={(mod) => {
              const mods = [...layerMods];
              mods[index] = mod;
              onChangeLayerMods(mods);
            }}
            onSelectDelete={() => {
              const mods = [...layerMods];
              mods.splice(index, 1);
              onChangeLayerMods(mods);
            }}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>
