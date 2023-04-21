<script lang="ts" type="module">
  import { Icon } from "figma-plugin-ds-svelte";

  export let iconName: string;
  export let onClick: () => void;
</script>

<div class="flex items-start" on:click={onClick}>
  <div class="flex rounded-md container">
    <Icon {iconName} />
  </div>
</div>

<style>
  .container:hover {
    background-color: var(--figma-color-bg-secondary);
  }
</style>
