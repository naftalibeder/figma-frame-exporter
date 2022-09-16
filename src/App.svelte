<script lang="ts" type="module">
  import "../styles/main.css";
  import { Page } from "types";
  import Nav from "./components/Nav.svelte";
  import Divider from "./components/Divider.svelte";
  import ConfigurePage from "./pages/ConfigurePage.svelte";

  let currentPage: Page = "configure";
</script>

<div class="flex flex-1 flex-col">
  <Nav bind:currentPage />
  <Divider />
  {#if currentPage === "configure"}
    <ConfigurePage />
  {:else if currentPage === "saved"}
    <div />
  {/if}
</div>
