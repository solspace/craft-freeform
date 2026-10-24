import { Fields } from "@ff-client/types/field.classes";
import type { FieldListRefs } from "@ff-client/types/groups";
import type { RefObject } from "react";
import Sortable from "sortablejs";
import { afterEach, describe, expect, it } from "vitest";
import {
  initializeGroupedSortable,
  initializeSortable,
} from "./sortable.initializer";

const instances: Sortable[] = [];
const makeList = () => {
  const list = document.createElement("div");
  document.body.append(list);
  return list;
};
const field = (type: string) => {
  const element = document.createElement("div");
  element.dataset.id = type;
  return element;
};
const setup = () => {
  const refs = {
    current: {
      unassigned: makeList(),
      hidden: makeList(),
      groupWrapper: makeList(),
    },
  } as RefObject<FieldListRefs>;
  initializeSortable(refs);
  const source = makeList(),
    group = makeList();
  initializeGroupedSortable(source, "content", refs, true);
  initializeGroupedSortable(group, "group", refs);
  instances.push(
    ...[
      source,
      group,
      refs.current.unassigned,
      refs.current.hidden,
      refs.current.groupWrapper,
    ].map((element) => Sortable.get(element)!),
  );
  return { refs, source, group };
};
const add = (source: HTMLElement, target: HTMLElement, item: HTMLElement) => {
  target.append(item);
  const handler = Sortable.get(target)!.option("onAdd")!;
  handler.call(Sortable.get(target), {
    item,
    from: source,
    to: target,
  } as Sortable.SortableEvent);
};
afterEach(() => {
  instances.splice(0).forEach((instance) => {
    instance.destroy();
  });
  document.body.innerHTML = "";
});

describe("catalog shortcuts", () => {
  it("keeps the source catalog while adding shortcuts and rejects duplicates within a group", () => {
    const { source, group } = setup();
    const original = field(Fields.Divider);
    source.append(original);
    expect(Sortable.get(source)!.option("sort")).toBe(false);
    add(source, group, original.cloneNode(true) as HTMLElement);
    expect(source.children).toHaveLength(1);
    expect(group.children).toHaveLength(1);
    add(source, group, original.cloneNode(true) as HTMLElement);
    expect(group.children).toHaveLength(1);
    expect(source.firstElementChild).toBe(original);
  });
  it("removes only the shortcut when it is returned to unassigned", () => {
    const { source, group, refs } = setup();
    const original = field(Fields.Html);
    source.append(original);
    const shortcut = original.cloneNode(true) as HTMLElement;
    add(source, group, shortcut);
    add(group, refs.current.unassigned!, shortcut);
    expect(group.children).toHaveLength(0);
    expect(refs.current.unassigned!.children).toHaveLength(0);
    expect(source.children).toHaveLength(1);
  });
  it("unhides a catalog option when adding its shortcut to a group", () => {
    const { source, group, refs } = setup();
    const original = field(Fields.Image);
    source.append(original);
    refs.current.hidden!.append(field(Fields.Image));
    add(source, group, original.cloneNode(true) as HTMLElement);
    expect(refs.current.hidden!.children).toHaveLength(0);
    expect(group.children).toHaveLength(1);
    expect(source.children).toHaveLength(1);
  });
});
