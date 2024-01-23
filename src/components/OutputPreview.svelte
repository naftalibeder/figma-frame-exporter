<script lang="ts" type="module">
  import { Section, Type, Divider } from "figma-svelte-components";
  import { Asset, Size } from "../types";
  import { EmptyText } from ".";

  export let totalNodeCt: number;
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
  <div>
    {#if exampleAssets.length === 0}
      <Type>Examples of output image files will appear below.</Type>
    {:else if exampleAssets.length < totalNodeCt}
      <Type>Previewing {exampleAssets.length} of {totalNodeCt} images.</Type>
    {:else}
      <Type>Previewing {exampleAssets.length} images.</Type>
    {/if}
  </div>
  <div class="mt-2">
    {#if exampleAssets.length > 0}
      {#each exampleAssets as exampleAsset, index}
        {#if index > 0}
          <Divider />
        {/if}

        <div class="flex flex-row content-between items-center gap-2 py-2">
          <img class="w-4 h-4" src={exampleAsset.url} alt="asset thumbnail" />
          <Type className="flex flex-1 whitespace-nowrap overflow-hidden">
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
