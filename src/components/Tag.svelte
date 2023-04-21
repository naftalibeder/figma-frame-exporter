<script lang="ts" type="module">
  import { Type } from "figma-plugin-ds-svelte";
</script>

<div
  class="flex h-fit px-1 py-0.5 mt-2 mr-2 outline outline-1 rounded-md whitespace-nowrap"
  style="outline-color: var(--figma-color-text)"
>
  <Type><slot /></Type>
</div>
