<script lang="ts" type="module">
  import { Type, Icon, Input, IconMinus, SelectMenu } from "figma-plugin-ds-svelte";
  import { LayerMod, layerProperties, LayerProperty, LayerPropertyOption } from "types";

  export let layerMod: LayerMod;
  export let matchedNodeCount: number;
  export let onChange: (mod: LayerMod) => void;
  export let onSelectDelete: () => void;

  let selectedLayerProperty: LayerProperty | undefined = undefined;
  $: {
    selectedLayerProperty = layerMod.property;
  }

  let layerPropertyOptions: LayerPropertyOption[] = [];
  $: {
    const options = layerProperties.map((o) => {
      return { value: o, label: o, group: null, selected: o === selectedLayerProperty };
    });
    layerPropertyOptions = [
      {
        value: undefined,
        label: "Select property",
        group: null,
        selected: selectedLayerProperty === undefined,
      },
      ...options,
    ];
  }
</script>

<div class="flex flex-row">
  <div class="flex flex-1 flex-col gap-1">
    <div class="flex flex-row items-center">
      <div class="flex flex-shrink-0 w-[32]">
        <Type>For</Type>
      </div>
      <div class="flex flex-1 relative">
        <Input
          class="flex flex-1"
          type="text"
          placeholder="Layers matching..."
          bind:value={layerMod.query}
          on:input={(e) => {
            layerMod.query = e.target["value"];
            onChange(layerMod);
          }}
        />
        <div class="flex flex-1 absolute h-full right-2">
          <div class="flex self-center opacity-40">
            <Type>{matchedNodeCount} matches</Type>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row items-center">
      <div class="flex flex-shrink-0 w-[32]">
        <Type>Set</Type>
      </div>
      <div class="flex flex-1 flex-row items-center gap-2">
        <div class="grow">
          <SelectMenu
            bind:menuItems={layerPropertyOptions}
            on:change={(e) => {
              layerMod.property = e.detail.value;
              onChange(layerMod);
            }}
          />
        </div>
        <Type>to</Type>
        <Input
          class="w-[80]"
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
