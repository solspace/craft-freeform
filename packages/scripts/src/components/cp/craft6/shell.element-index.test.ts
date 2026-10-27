import { afterEach, expect, it, vi } from "vitest";
import { enhanceCraft6ElementIndex } from "./shell.element-index";

afterEach(() => document.body.replaceChildren());

it("retains live search, filters, sources, pagination, and export bindings in the native pane", async () => {
  document.body.innerHTML = `<main>
    <div id="header-container"><header><h1>Submissions</h1><div id="toolbar">
      <div data-export-wrapper><button id="quick-export">Export</button></div>
      <div class="search-container"><span class="texticon-icon"></span>
        <craft-input><input value="existing search"></craft-input>
        <button class="clear-btn">Clear</button><button class="filter-btn">Filter</button>
      </div>
    </div></header></div>
    <div id="main-content"><nav id="sources">Forms</nav>
      <div id="content-container"><div id="content">
        <craft-pane id="freeform-index-pane" padding="lg" hidden></craft-pane>
        <div id="elements">Rows</div><footer id="footer">Pagination</footer>
      </div></div>
    </div></main>`;
  const input = document.querySelector("input")!;
  const filter = document.querySelector<HTMLButtonElement>(".filter-btn")!;
  const exportWrapper = document.querySelector("[data-export-wrapper]")!;
  const click = vi.fn();
  filter.addEventListener("click", click);

  enhanceCraft6ElementIndex();
  enhanceCraft6ElementIndex();
  const pane = document.querySelector<HTMLElement>("craft-pane")!;
  expect(pane.hidden).toBe(false);
  expect(pane.querySelector("input")).toBe(input);
  expect(input.value).toBe("existing search");
  expect(pane.querySelector('[slot="suffix"] .filter-btn')).toBe(filter);
  expect(pane.querySelectorAll('craft-icon[slot="prefix"]')).toHaveLength(1);
  expect(pane.querySelector("#footer")?.textContent).toBe("Pagination");
  expect(pane.contains(document.querySelector("#sources"))).toBe(false);
  filter.click();
  expect(click).toHaveBeenCalledOnce();

  const toolbar = document.querySelector("#toolbar")!;
  toolbar.append(document.createElement("button"));
  await Promise.resolve();
  expect(toolbar.lastElementChild).toBe(exportWrapper);
  expect(exportWrapper.querySelector("#quick-export")).not.toBeNull();
});

it("leaves other CP pages unchanged", () => {
  document.body.innerHTML = "<main><h1>Settings</h1></main>";
  enhanceCraft6ElementIndex();
  expect(document.body.innerHTML).toBe("<main><h1>Settings</h1></main>");
});
