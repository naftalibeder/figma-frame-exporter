<script lang="ts" type="module">
  import { Section, SelectMenu } from "figma-plugin-ds-svelte";
  import { Config, ConfigOption } from "types";

  export let selectedConfigId: string;
  export let configs: Record<string, Config>;
  export let onChange: (id: string) => void;

  $: configsSorted = Object.values(configs).sort((a, b) => a.index - b.index);

  let configOptions: ConfigOption[] = [];
  $: {
    configOptions = configsSorted.map((config, i) => {
      return {
        value: config.id,
        label: config.name === "" ? "(No name)" : config.name,
        group: null,
        selected: config.id === selectedConfigId,
      };
    });
  }
</script>

<div>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col">
      <Section>Active configuration</Section>
    </div>

    <SelectMenu
      bind:menuItems={configOptions}
      on:change={(e) => {
        selectedConfigId = e.detail.value;
        onChange(selectedConfigId);
      }}
    />
  </div>
</div>
