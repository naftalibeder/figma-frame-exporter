<script lang="ts" type="module">
  import { Type, Section, Icon, IconPlus } from "figma-plugin-ds-svelte";
  import { store } from "store";
  import { buildDefaultConfig } from "utils";
  import SavedConfigItem from "../components/SavedConfigItem.svelte";
  import Divider from "../components/Divider.svelte";

  $: configKeys = Object.keys($store.configs);

  const onSelectConfig = (id: string) => {
    $store.selectedConfigId = id;
  };

  const onSelectAdd = () => {
    const newConfig = buildDefaultConfig();

    $store.selectedConfigId = newConfig.id;
    $store.configs = {
      ...$store.configs,
      [newConfig.id]: newConfig,
    };
  };

  const onSelectDelete = (id: string) => {
    if (configKeys.length > 1) {
      delete $store.configs[id];
      $store.configs = { ...$store.configs };
    } else {
      const newConfig = buildDefaultConfig();

      $store.selectedConfigId = newConfig.id;
      $store.configs = {
        [newConfig.id]: newConfig,
      };
    }

    if (!$store.configs[$store.selectedConfigId]) {
      $store.selectedConfigId = configKeys[0];
    }
  };

  const onChangeConfigName = (id: string, name: string) => {
    $store.configs[id] = {
      ...$store.configs[id],
      name,
    };
  };
</script>

<div class="section">
  <div class="flex flex-row gap-2 justify-between">
    <div class="flex flex-col">
      <Section>Saved configurations</Section>
      <div class="section-subtitle">
        <Type>Click any configuration to set it as active.</Type>
      </div>
    </div>
    <div class="flex items-start" on:click={() => onSelectAdd()}>
      <div class="flex rounded-md hover:bg-gray-100">
        <Icon iconName={IconPlus} />
      </div>
    </div>
  </div>
  <div class="scroll-box rounded-box max-h-[826]">
    {#each Object.entries($store.configs) as [id, config], index}
      {#if index > 0}
        <Divider />
      {/if}

      <SavedConfigItem
        {config}
        isSelected={id === $store.selectedConfigId}
        isSoleItem={configKeys.length === 1}
        onSelect={() => onSelectConfig(id)}
        onChangeConfigName={(name) => onChangeConfigName(id, name)}
        onSelectDelete={() => onSelectDelete(id)}
      />
    {/each}
  </div>
</div>
