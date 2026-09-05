import { render } from "solid-js/web";
import Page from "./app/page";

const el = document.getElementById("root");
if (!el) throw new Error("missing #root");

const dispose = render(() => <Page />, el);
if (import.meta.hot) {
  import.meta.hot.dispose(() => dispose());
}
