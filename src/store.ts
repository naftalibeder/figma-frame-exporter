import { writable } from "svelte/store";
import { Store } from "./types";

export const store = writable<Store | undefined>();

store.subscribe((s) => {
  if (!s) {
    return;
  }

  const message = {
    type: "SET_STORE",
    store: s,
  };
  parent.postMessage({ pluginMessage: message }, "*");
});
