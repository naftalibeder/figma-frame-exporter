<script lang="ts">
  export let onClick: () => void;
  export let disabled = false;
</script>

<button on:click={onClick} {disabled}>
  <slot />
</button>
