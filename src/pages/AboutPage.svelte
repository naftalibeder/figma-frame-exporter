<script lang="ts" type="module">
  import { Type, Section } from "figma-plugin-ds-svelte";
  import Divider from "../components/Divider.svelte";
</script>

<div class="flex flex-1 flex-col overflow-y-hidden">
  <div class="flex flex-1 flex-col w-full overflow-y-scroll">
    <div class="section">
      <div class="flex flex-col gap-2">
        <Section>General</Section>
        <div class="section-subtitle">
          <Type
            >Frame Exporter is developed by Naftali Beder and is free to use. The code is open
            source and available on <a
              href="https://github.com/naftalibeder/figma-frame-exporter"
              target="_blank"
            >
              GitHub</a
            >.
          </Type>
        </div>
        <div class="section-subtitle">
          <Type
            >Bug reports and feature requests are welcome, and can be posted as issues on the GitHub
            page, or sent to <a href="mailto:naftali@naftalibeder.com" target="_blank"
              >naftali@naftalibeder.com</a
            >.</Type
          >
        </div>
      </div>
    </div>

    <Divider />

    <div class="section">
      <div class="flex flex-col gap-2">
        <Section>Support</Section>
        <div class="section-subtitle">
          <Type
            >If you find Frame Exporter useful and want to show your support, please consider
            telling someone else about it, clicking the heart icon on its <a
              href="https://www.figma.com/community/plugin/1074101625913782131"
              target="_blank"
            >
              product page</a
            >, or
            <a href="https://www.buymeacoffee.com/naftalibeder" target="_blank"
              >buying me a coffee</a
            >.</Type
          >
        </div>
      </div>
    </div>
  </div>
</div>
