import { createRoot } from "react-dom/client";
import Page from "./app/page";

const el = document.getElementById("root");
if (!el) throw new Error("missing #root");

const hot = import.meta.hot;
if (hot) {
  const root = (hot.data.root ??= createRoot(el));
  root.render(<Page />);
} else {
  createRoot(el).render(<Page />);
}
