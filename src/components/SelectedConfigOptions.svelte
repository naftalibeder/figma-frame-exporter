<script lang="ts" type="module">
  import {
    Section,
    SelectMenu,
    type SelectMenuItem,
  } from "figma-svelte-components";
  import { Config, ConfigId } from "../types";

  export let selectedConfigId: ConfigId;
  export let configs: Record<ConfigId, Config>;
  export let onChange: (id: string) => void;

  const configOptions: SelectMenuItem<ConfigId>[] = ((
    _configs: Record<ConfigId, Config>
  ) => {
    const values = Object.values(_configs);
    const sorted = values.sort((a, b) => a.index - b.index);
    return sorted.map((config, i) => {
      return {
        id: config.id,
        label: config.name === "" ? "(No name)" : config.name,
      };
    });
  })(configs);
</script>

<div>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col">
      <Section>Active configuration</Section>
    </div>

    <SelectMenu
      items={configOptions}
      selectedItemId={selectedConfigId}
      placeholder={"Select one"}
      onChangeSelectedItem={(itemId) => {
        selectedConfigId = itemId;
        onChange(selectedConfigId);
      }}
    />
  </div>
</div>
