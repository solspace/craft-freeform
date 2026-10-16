import type { FormWithGroup } from "@ff-client/types/form-groups";
import type { FormWithStats } from "@ff-client/types/forms";
import { describe, expect, it } from "vitest";
import { keyboardMove, moveCard } from "./grid.order";

const form = (id: number) => ({ id }) as FormWithStats;
const fixture = (): FormWithGroup => ({
  forms: [form(4), form(5)],
  archivedForms: [form(6)],
  formGroups: {
    siteId: 2,
    site: "english",
    groups: [
      {
        uid: "a",
        label: "Sales",
        formIds: [1, 90, 2],
        forms: [form(1), form(2)],
      },
      { uid: "b", label: "Support", formIds: [3], forms: [form(3)] },
      { uid: "empty", label: "Empty", formIds: [], forms: [] },
    ],
  },
});

describe("dashboard form moves", () => {
  it("reorders a group while retaining hidden memberships, metadata and the input", () => {
    const data = fixture();
    const updated = moveCard(data, { formId: 2, groupUid: "a", beforeId: 1 });
    expect(updated.formGroups.groups[0].formIds).toEqual([2, 1, 90]);
    expect(updated.formGroups.groups[0].forms.map((form) => form.id)).toEqual([
      2, 1,
    ]);
    expect(updated.formGroups.siteId).toBe(2);
    expect(updated.formGroups.groups[0].label).toBe("Sales");
    expect(data.formGroups.groups[0].formIds).toEqual([1, 90, 2]);
    expect(updated.archivedForms).toBe(data.archivedForms);
  });
  it("moves a form to an empty group and then back to Other", () => {
    const moved = moveCard(fixture(), {
      formId: 4,
      groupUid: "empty",
      beforeId: null,
    });
    expect(moved.forms.map((form) => form.id)).toEqual([5]);
    expect(moved.formGroups.groups[2].formIds).toEqual([4]);
    const returned = moveCard(moved, {
      formId: 4,
      groupUid: null,
      beforeId: 5,
    });
    expect(returned.forms.map((form) => form.id)).toEqual([4, 5]);
    expect(returned.formGroups.groups[2].formIds).toEqual([]);
  });
  it("moves between groups without duplicating membership", () => {
    const moved = moveCard(fixture(), {
      formId: 1,
      groupUid: "b",
      beforeId: 3,
    });
    expect(moved.formGroups.groups.map((group) => group.formIds)).toEqual([
      [90, 2],
      [1, 3],
      [],
    ]);
  });
  it("ignores missing forms and deleted targets", () => {
    const data = fixture();
    expect(moveCard(data, { formId: 99, groupUid: "a", beforeId: null })).toBe(
      data,
    );
    expect(
      moveCard(data, { formId: 1, groupUid: "deleted", beforeId: null }),
    ).toBe(data);
  });
  it("supports keyboard ordering and changing groups, including empty ones", () => {
    const data = fixture();
    expect(keyboardMove(data, 1, "ArrowDown")).toEqual({
      formId: 1,
      groupUid: "a",
      beforeId: null,
    });
    expect(keyboardMove(data, 2, "ArrowUp")).toEqual({
      formId: 2,
      groupUid: "a",
      beforeId: 1,
    });
    expect(keyboardMove(data, 3, "ArrowRight")).toEqual({
      formId: 3,
      groupUid: "empty",
      beforeId: null,
    });
    expect(keyboardMove(data, 1, "ArrowLeft")).toBeUndefined();
    expect(keyboardMove(data, 5, "ArrowDown")).toBeUndefined();
  });
});
