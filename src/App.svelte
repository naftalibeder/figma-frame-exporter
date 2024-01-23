<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Divider } from "figma-svelte-components";
  import { Page } from "./types";
  import { store } from "./store";
  import { log } from "./utils";
  import { ConfigurePage, SavedPage, AboutPage } from "./pages";
  import { Nav } from "./components";

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "INIT",
        },
      },
      "*"
    );
  });

  window.onmessage = async (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    const type = message.type;
    log("Message:", type, message);

    if (type === "LOAD") {
      if (message.store) {
        $store = message.store;
      }
    }
  };

  let currentPage: Page = "configure";
</script>

<div class="flex flex-1 flex-col h-[900] overflow-hidden">
  <Nav bind:currentPage />
  <Divider />

  {#if $store}
    <div class="flex flex-1 overflow-y-hidden">
      {#if currentPage === "configure"}
        <ConfigurePage />
      {:else if currentPage === "saved"}
        <SavedPage />
      {:else if currentPage === "about"}
        <AboutPage />
      {/if}
    </div>
  {/if}
</div>
