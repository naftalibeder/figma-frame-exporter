<script lang="ts" type="module">
  import { Type, Icon, Input, IconMinus } from "figma-plugin-ds-svelte";
  import { LayerMod } from "types";

  export let layerMod: LayerMod;
  export let onChange: (mod: LayerMod) => void;
  export let onSelectDelete: () => void;
</script>

<div class="flex flex-row">
  <div class="flex flex-1 flex-col gap-1">
    <div class="flex flex-row items-center">
      <div class="flex flex-shrink-0 w-[40]">
        <Type>For</Type>
      </div>
      <div class="flex flex-1 flex-row items-center gap-2">
        <Input
          type="text"
          placeholder="Layers matching..."
          bind:value={layerMod.query}
          on:input={(e) => {
            layerMod.query = e.target["value"];
            onChange(layerMod);
          }}
        />
      </div>
    </div>
    <div class="flex flex-row items-center">
      <div class="flex flex-shrink-0 w-[40]">
        <Type>Set</Type>
      </div>
      <div class="flex flex-1 flex-row items-center gap-2">
        <Input
          type="text"
          placeholder="Property"
          bind:value={layerMod.property}
          on:input={(e) => {
            layerMod.property = e.target["value"];
            onChange(layerMod);
          }}
        />
        <Type>to</Type>
        <Input
          type="text"
          placeholder="Value"
          bind:value={layerMod.value}
          on:input={(e) => {
            layerMod.value = e.target["value"];
            onChange(layerMod);
          }}
        />
      </div>
    </div>
  </div>
  <div class="flex items-start" on:click={onSelectDelete}>
    <div class="flex rounded-md hover:bg-gray-100">
      <Icon iconName={IconMinus} />
    </div>
  </div>
</div>
