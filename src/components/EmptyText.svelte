<script lang="ts" type="module">
  import { Type } from "figma-plugin-ds-svelte";
</script>

<div class="flex py-1">
  <Type>
    <div class="text-gray-400">
      <slot />
    </div>
  </Type>
</div>
