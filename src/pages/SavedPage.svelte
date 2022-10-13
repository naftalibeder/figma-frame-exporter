<script lang="ts" type="module">
  import { Type, Section, Icon, IconPlus } from "figma-plugin-ds-svelte";
  import { store } from "store";
  import { buildDefaultConfig } from "utils";
  import SavedConfigItem from "../components/SavedConfigItem.svelte";
  import Divider from "../components/Divider.svelte";

  $: configKeys = Object.keys($store.configs);

  const onSelectActivate = (id: string) => {
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

  const onSelectDuplicate = (id: string) => {
    const defaultConfig = buildDefaultConfig();

    const newConfig = { ...$store.configs[id] };
    newConfig.id = defaultConfig.id;

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

<div class="flex flex-1 flex-col overflow-y-hidden">
  <div class="flex flex-1 flex-col w-full overflow-y-scroll">
    <div class="section">
      <div class="flex flex-row gap-2 justify-between">
        <div class="flex flex-col">
          <Section>Saved configurations</Section>
          <div class="section-subtitle">
            <Type>Add a new configuration or rename an existing one.</Type>
          </div>
        </div>
        <div class="flex items-start" on:click={() => onSelectAdd()}>
          <div class="flex rounded-md hover:bg-gray-100">
            <Icon iconName={IconPlus} />
          </div>
        </div>
      </div>
      <div class="space-y-4 mt-4">
        {#each Object.entries($store.configs) as [id, config], index}
          {#if index > 0}
            <div class="px-2">
              <Divider />
            </div>
          {/if}

          <div class="pl-2">
            <SavedConfigItem
              {config}
              isActive={id === $store.selectedConfigId}
              onSelectActivate={() => onSelectActivate(id)}
              onChangeConfigName={(name) => onChangeConfigName(id, name)}
              onSelectDuplicate={() => onSelectDuplicate(id)}
              onSelectDelete={() => onSelectDelete(id)}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
