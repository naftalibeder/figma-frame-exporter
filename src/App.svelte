<script lang="ts" type="module">
  import { onMount } from "svelte";
  import { Page } from "types";
  import { store } from "store";
  import { log } from "utils";
  import ConfigurePage from "./pages/ConfigurePage.svelte";
  import SavedPage from "./pages/SavedPage.svelte";
  import Nav from "./components/Nav.svelte";
  import Divider from "./components/Divider.svelte";
  import "../styles/main.css";

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

<div class="flex flex-1 flex-col">
  <Nav bind:currentPage />
  <Divider />

  {#if $store}
    {#if currentPage === "configure"}
      <ConfigurePage config={$store.configs[$store.selectedConfigId]} />
    {:else if currentPage === "saved"}
      <SavedPage />
    {/if}
  {/if}
</div>
