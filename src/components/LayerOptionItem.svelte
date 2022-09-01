<script lang="ts" type="module">
  import { Icon, Input, IconMinus } from "figma-plugin-ds-svelte";
  import { LayerMod } from "types";

  export let layerMod: LayerMod;
  export let onChange: (mod: LayerMod) => void;
</script>

<div class="flex flex-col py-2 gap-2">
  <div class="flex flex-row gap-1">
    <Input
      type="text"
      placeholder="Search"
      bind:value={layerMod.query}
      on:input={(e) => {
        layerMod.query = e.target["value"];
        onChange(layerMod);
      }}
    />
    <Input
      type="text"
      placeholder="Property"
      bind:value={layerMod.property}
      on:input={(e) => {
        layerMod.property = e.target["value"];
        onChange(layerMod);
      }}
    />
    <Input
      type="text"
      placeholder="Value"
      bind:value={layerMod.value}
      on:input={(e) => {
        layerMod.value = e.target["value"];
        onChange(layerMod);
      }}
    />
    <Icon iconName={IconMinus} />
  </div>
</div>
