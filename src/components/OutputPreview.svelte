<script lang="ts" type="module">
  import { Section, Type } from "figma-plugin-ds-svelte";
  import { Asset, Size } from "../types";
  import Divider from "./Divider.svelte";
  import EmptyText from "./EmptyText.svelte";

  export let exampleAssets: Asset[];

  const displaySize = (size: Size): string => {
    const rounded: Size = {
      width: Math.round(size.width),
      height: Math.round(size.height),
    };
    return `${rounded.width}x${rounded.height}`;
  };
</script>

<div>
  <Section>Preview</Section>
  <div class="section-subtitle">
    <Type>Examples of output image files will appear below.</Type>
  </div>
  <div class="mt-2 px-2">
    {#if exampleAssets.length > 0}
      {#each exampleAssets as exampleAsset, index}
        {#if index > 0}
          <Divider />
        {/if}

        <div class="flex flex-row content-between items-center gap-2 py-2">
          <img class="w-4 h-4" src={exampleAsset.url} alt="asset thumbnail" />
          <Type class="flex flex-1 whitespace-nowrap overflow-hidden">
            {exampleAsset.filename}.{exampleAsset.extension.toLowerCase()}
          </Type>
          {#if exampleAsset.size}
            <Type>
              {displaySize(exampleAsset.size)}
            </Type>
          {/if}
        </div>
      {/each}
    {:else}
      <EmptyText>No frames selected.</EmptyText>
    {/if}
  </div>
</div>
