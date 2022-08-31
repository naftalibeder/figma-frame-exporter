<script lang="ts" type="module">
  import { Type, Section, Input } from "figma-plugin-ds-svelte";

  export let hideNodes: string[];
  export let onChangeExcludeConfig: (hideNodes: string[]) => void;

  $: text = hideNodes.join(", ");
</script>

<div class="flex flex-1 flex-col">
  <Section>Exclude sublayers</Section>
  <div class="section-subtitle">
    <Type>Any layers named below, separated by commas, will be excluded from exports.</Type>
  </div>
  <Input
    class="mt-2"
    type="text"
    placeholder="E.g. 'Background, Icon-Content'"
    bind:value={text}
    on:input={(e) => {
      const value = e.target["value"];
      const nodes = value
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);
      onChangeExcludeConfig(nodes);
    }}
  />
</div>
