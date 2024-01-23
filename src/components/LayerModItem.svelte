<script lang="ts" type="module">
  import {
    Type,
    Input,
    SelectMenu,
    IconButton,
    type SelectMenuItem,
  } from "figma-svelte-components";
  import { LayerMod, layerProperties, LayerProperty } from "../types";

  export let layerMod: LayerMod;
  export let matchedNodeCount: number;
  export let onChange: (mod: LayerMod) => void;
  export let onSelectDelete: () => void;

  let selectedLayerPropertyId: LayerProperty | undefined = undefined;
  $: {
    selectedLayerPropertyId = layerMod.property;
  }

  const layerPropertyOptions: SelectMenuItem<LayerProperty>[] =
    layerProperties.map((o) => {
      return {
        id: o,
        label: o,
      };
    });
</script>

<div class="flex flex-row space-x-2">
  <div class="flex flex-1 flex-col gap-1">
    <div class="flex flex-row items-center">
      <div class="flex flex-shrink-0 w-[32]">
        <Type>For</Type>
      </div>
      <div class="flex flex-1 relative">
        <Input
          className="flex flex-1"
          placeholder="Layers matching..."
          bind:value={layerMod.query}
          on:input={(e) => {
            layerMod.query = e.target["value"];
            onChange(layerMod);
          }}
        />
        <div class="flex flex-1 absolute h-full right-2">
          <div class="flex self-center opacity-40">
            <Type
              >{matchedNodeCount}
              {matchedNodeCount === 1 ? "match" : "matches"}</Type
            >
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row items-center">
      <div class="flex flex-shrink-0 w-[32]">
        <Type>Set</Type>
      </div>
      <div class="flex flex-1 flex-row items-center gap-2 relative">
        <div class="grow relative">
          <SelectMenu
            items={layerPropertyOptions}
            selectedItemId={selectedLayerPropertyId}
            placeholder={"Select property"}
            onChangeSelectedItem={(itemId) => {
              layerMod.property = itemId;
              onChange(layerMod);
            }}
          />
        </div>
        <Type>to</Type>
        <Input
          className="w-[80]"
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
  <IconButton kind={"minus"} onClick={onSelectDelete} />
</div>
