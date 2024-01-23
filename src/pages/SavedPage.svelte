<script lang="ts" type="module">
  import { onMount } from "svelte";
  import {
    Type,
    Section,
    Input,
    IconButton,
    Divider,
  } from "figma-svelte-components";
  import { store } from "../store";
  import { buildDefaultConfig, log } from "../utils";
  import { Store } from "../types";
  import { SavedConfigItem } from "../components";

  $: configKeys = Object.keys($store.configs);
  $: configsSorted = Object.values($store.configs).sort(
    (a, b) => a.index - b.index
  );
  $: maxConfigIndex = configsSorted[-1]?.index ?? 0;

  let code = "";

  onMount(() => {
    updateCodeFromConfigs();
  });

  const onSelectActivate = (id: string) => {
    $store.selectedConfigId = id;
  };

  const onSelectAdd = () => {
    const newConfig = buildDefaultConfig(maxConfigIndex + 1);

    $store.selectedConfigId = newConfig.id;
    $store.configs = {
      ...$store.configs,
      [newConfig.id]: newConfig,
    };

    updateCodeFromConfigs();
  };

  const onSelectDuplicate = (id: string) => {
    const defaultConfig = buildDefaultConfig(maxConfigIndex + 1);

    const newConfig = { ...$store.configs[id] };
    newConfig.id = defaultConfig.id;

    $store.configs = {
      ...$store.configs,
      [newConfig.id]: newConfig,
    };

    updateCodeFromConfigs();
  };

  const onSelectMove = (id: string, direction: "up" | "down") => {
    const updatedConfigs = { ...$store.configs };

    const sourceIndex = updatedConfigs[id].index;
    const targetIndex =
      updatedConfigs[id].index + (direction === "up" ? -1 : 1);

    const targetId = Object.entries(updatedConfigs).find(
      ([k, v]) => v.index === targetIndex
    )?.[0];
    if (targetId === undefined) {
      return;
    }

    updatedConfigs[id].index = targetIndex;
    updatedConfigs[targetId].index = sourceIndex;

    $store.configs = { ...updatedConfigs };

    updateCodeFromConfigs();
  };

  const onSelectDelete = (id: string) => {
    if (configKeys.length > 1) {
      delete $store.configs[id];
      $store.configs = { ...$store.configs };
    } else {
      const newConfig = buildDefaultConfig(maxConfigIndex + 1);

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
      console.error("Error generating code:", e);
    }
  };

  const updateConfigsFromCode = (updatedCode: string) => {
    if (updatedCode === "") {
      return;
    }

    log(`Received new config code: ${updatedCode}`);
    code = updatedCode;

    try {
      const configsStr = atob(code);
      const configs = JSON.parse(configsStr) as Store["configs"];
      if (Object.keys(configs).length === 0) {
        throw "No configs found";
      }

      $store.configs = configs;
      $store.selectedConfigId = Object.values(configs)[0].id;
    } catch (e) {
      console.error("Error parsing code:", e);
    }
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
          <div>
            <Type
              >{configKeys.length} saved. You can add a new configuration, or activate
              an existing one to edit.</Type
            >
          </div>
        </div>
        <IconButton kind={"plus"} onClick={onSelectAdd} />
      </div>
      <div class="space-y-4 mt-4">
        {#each configsSorted as config, i}
          {#if i > 0}
            <div class="pr-2">
              <Divider />
            </div>
          {/if}

          <SavedConfigItem
            {config}
            isActive={config.id === $store.selectedConfigId}
            onSelectActivate={() => onSelectActivate(config.id)}
            onChangeConfigName={(name) => onChangeConfigName(config.id, name)}
            onSelectDuplicate={() => onSelectDuplicate(config.id)}
            onSelectMove={(direction) => onSelectMove(config.id, direction)}
            onSelectDelete={() => onSelectDelete(config.id)}
          />
        {/each}
      </div>
    </div>

    <Divider />

    <div class="section">
      <div class="flex flex-col">
        <Section>Share configurations</Section>
        <div>
          <Type
            >Copy the code below to back up or share your configurations, or
            paste another code to load saved configurations.</Type
          >
        </div>
      </div>
      <div class="space-y-4 mt-4">
        <Input
          className={"flex flex-1"}
          placeholder={"Configuration code"}
          value={code}
          on:focus={onCodeInputFocus}
          on:keydown={onCodeInputKeyDown}
          on:blur={onCodeInputBlur}
        />
      </div>
    </div>
  </div>
</div>
