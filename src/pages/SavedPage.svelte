<script lang="ts" type="module">
  import { Type, Section, Icon, IconPlus, Input } from "figma-plugin-ds-svelte";
  import { store } from "store";
  import { buildDefaultConfig, log } from "utils";
  import SavedConfigItem from "../components/SavedConfigItem.svelte";
  import Divider from "../components/Divider.svelte";
  import { onMount } from "svelte";

  $: configKeys = Object.keys($store.configs);
  let code = "";

  onMount(() => {
    updateCodeFromConfigs();
  });

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

    updateCodeFromConfigs();
  };

  const onSelectDuplicate = (id: string) => {
    const defaultConfig = buildDefaultConfig();

    const newConfig = { ...$store.configs[id] };
    newConfig.id = defaultConfig.id;

    $store.configs = {
      ...$store.configs,
      [newConfig.id]: newConfig,
    };

    updateCodeFromConfigs();
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

    updateCodeFromConfigs();
  };

  const onChangeConfigName = (id: string, name: string) => {
    $store.configs[id] = {
      ...$store.configs[id],
      name,
    };

    updateCodeFromConfigs();
  };

  const updateCodeFromConfigs = () => {
    try {
      const configsStr = JSON.stringify($store.configs);
      const configsBase64 = btoa(configsStr);
      code = configsBase64;
    } catch (e) {
      alert(`Cannot generate code: ${e}`);
    }
  };

  const updateConfigsFromCode = (updatedCode: string) => {
    if (updatedCode === "" || updatedCode === code) {
      return;
    }

    log(`Received new config code: ${updatedCode}`);
    code = updatedCode;

    try {
      const configsStr = atob(code);
      const configs = JSON.parse(configsStr);
      $store.configs = configs;
    } catch (e) {}
  };

  const onCodeInputFocus = (e: FocusEvent) => {
    const elem = e.target as HTMLInputElement;
    elem.select();
  };

  const onCodeInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const elem = e.target as HTMLElement;
      elem.blur();
    }
  };

  const onCodeInputBlur = (e: FocusEvent) => {
    const updatedCode = e.target["value"];
    updateConfigsFromCode(updatedCode);
  };
</script>

<div class="flex flex-1 flex-col overflow-y-hidden">
  <div class="flex flex-1 flex-col w-full overflow-y-scroll">
    <div class="section">
      <div class="flex flex-row gap-2 justify-between">
        <div class="flex flex-col">
          <Section>Saved configurations</Section>
          <div class="section-subtitle">
            <Type
              >{configKeys.length} saved. You can add a new configuration, or activate an existing one
              to edit.</Type
            >
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

    <Divider />

    <div class="section">
      <div class="flex flex-col">
        <Section>Sharing</Section>
        <div class="section-subtitle">
          <Type
            >Copy the code below to share your configurations, or paste a new one. (Warning: this
            will overwrite your existing configurations!)</Type
          >
        </div>
      </div>
      <div class="space-y-4 mt-4">
        <Input
          id="code-input"
          class="flex flex-1"
          placeholder="Configuration code"
          value={code}
          on:focus={onCodeInputFocus}
          on:keydown={onCodeInputKeyDown}
          on:blur={onCodeInputBlur}
        />
      </div>
    </div>
  </div>
</div>
