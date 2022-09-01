<script lang="ts" type="module">
  import { Type, Section } from "figma-plugin-ds-svelte";
  import { LayerMod } from "types";
  import Divider from "./Divider.svelte";
  import LayerOptionItem from "./LayerOptionItem.svelte";

  export let layerMods: LayerMod[];
  export let onChangeLayerMods: (mods: LayerMod[]) => void;
</script>

<div>
  <Section>Modify layers</Section>
  <div class="section-subtitle">
    <Type>Modify the properties of all layers that match the search text.</Type>
  </div>
  <div class="scroll-box rounded-box h-[206]">
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
      />
    {/each}
  </div>
</div>
