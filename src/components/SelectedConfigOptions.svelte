<script lang="ts" type="module">
  import { Section, SelectMenu } from "figma-plugin-ds-svelte";
  import { Config, ConfigOption } from "types";

  export let selectedConfigId: string;
  export let configs: Record<string, Config>;
  export let onChange: (id: string) => void;

  let configOptions: ConfigOption[] = Object.entries(configs).map(([id, config]) => {
    return {
      value: id,
      label: config.name,
      group: null,
      selected: false,
    };
  });
  $: {
    configOptions.forEach((o, i) => {
      configOptions[i].selected = o.value === selectedConfigId;
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
