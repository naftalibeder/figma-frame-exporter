<script lang="ts" type="module">
  import { Type } from "figma-svelte-components";
</script>

<div
  class="flex h-fit px-1 py-0.5 mt-2 mr-2 outline outline-1 rounded-md whitespace-nowrap"
>
  <Type><slot /></Type>
</div>

<style>
  div {
    color: var(--figma-color-text-tertiary);
    outline-color: var(--figma-color-text-tertiary);
  }

  div:hover {
    color: var(--figma-color-text);
    outline-color: var(--figma-color-text);
  }
</style>
