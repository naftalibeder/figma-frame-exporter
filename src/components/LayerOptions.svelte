<script lang="ts" type="module">
  import { Type, Input, Section } from "figma-plugin-ds-svelte";
  import { LayerMod } from "types";
  import Divider from "./Divider.svelte";

  export let layerMods: LayerMod[];
  // export let onChangeLayerMods: (mods: LayerMod[]) => void;
</script>

<div>
  <Section>Modify layers</Section>
  <div class="section-subtitle">
    <Type>Modify the properties of all layers that match.</Type>
  </div>
  <div class="scroll-box rounded-box h-[206]">
    {#each layerMods as layerMod, index}
      {#if index > 0}
        <Divider />
      {/if}

      <div class="flex flex-col py-2 gap-2">
        <Input
          type="text"
          placeholder="Enter a string or regex"
          bind:value={layerMods[index].query}
          on:input={(e) => {
            layerMods[index].query = e.target["value"];
          }}
        />
        <div class="flex flex-row gap-2">
          <div class="flex flex-1 flex-col">
            <Input
              type="text"
              placeholder="Enter a layer property name"
              bind:value={layerMods[index].property}
              on:input={(e) => {
                layerMods[index].property = e.target["value"];
              }}
            />
          </div>
          <div class="flex flex-1 flex-col">
            <Input
              type="text"
              placeholder="Enter a property value"
              bind:value={layerMods[index].value}
              on:input={(e) => {
                layerMods[index].value = e.target["value"];
              }}
            />
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
