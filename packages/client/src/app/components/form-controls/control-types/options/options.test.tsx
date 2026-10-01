import fieldsReducer, {
  type Field,
  fieldActions,
} from "@editor/store/slices/layout/fields";
import optionSourcesReducer from "@editor/store/slices/option-sources";
import type { OptionsProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Options from "./options";
import type {
  ConfigurationProps,
  CustomOptionsConfiguration,
  OptionsConfiguration,
} from "./options.types";
import { Source } from "./options.types";

vi.mock("@editor/store", async () => {
  const { useDispatch, useSelector } = await import("react-redux");
  return { useAppDispatch: useDispatch, useAppSelector: useSelector };
});
vi.mock("@editor/store/slices/layout/fields/fields.persistence", () => ({}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    editions: { isAtLeast: () => true },
    limitations: { can: () => true },
  },
  Edition: { Lite: "lite" },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldType: () => ({ implements: [] }),
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({ willTranslate: () => false }),
}));
vi.mock("@components/options/use-field-options", () => ({
  useFieldOptions: () => [
    [{ label: "Converted", value: "converted@example.com" }],
  ],
}));
vi.mock("@components/form-controls/control.styles", () => ({
  ControlWrapper: "div",
}));
vi.mock("@components/form-controls/label.styles", () => ({ Label: "span" }));
vi.mock("@components/form-controls/error-list", () => ({
  FormErrorList: () => null,
}));
vi.mock("./sources/translations/translations", () => ({
  OptionsTranslatable: () => null,
}));
vi.mock("@components/elements/button-group/button-group", () => ({
  ButtonGroup: ({ onClick }: { onClick: (source: string) => void }) => (
    <>
      {["custom", "elements", "predefined"].map((source) => (
        <button type="button" key={source} onClick={() => onClick(source)}>
          {source}
        </button>
      ))}
    </>
  ),
}));

let sourceProps: ConfigurationProps;
vi.mock("./sources/source.component", () => ({
  SourceComponent: (props: ConfigurationProps) => {
    sourceProps = props;
    return null;
  },
}));

const custom: CustomOptionsConfiguration = {
  source: Source.Custom,
  useCustomValues: true,
  options: [
    { label: "Choose a department", value: "" },
    { label: "Departments", value: "departments", optgroup: true },
    { label: "Sales", value: "sales@example.com" },
    { label: "Support", value: "support@example.com" },
  ],
};
const elements: OptionsConfiguration = {
  source: Source.Elements,
  typeClass: "Entries",
  emptyOption: "Choose an entry",
  properties: { section: ["news"], label: "{{ title }}" },
};
const predefined: OptionsConfiguration = {
  source: Source.Predefined,
  typeClass: "Countries",
  emptyOption: "Choose a country",
  properties: { format: "full" },
};
const property: OptionsProperty = {
  type: PropertyType.Options,
  handle: "optionConfiguration",
  label: "Options",
};
const makeField = (uid: string, value: OptionsConfiguration): Field => ({
  id: 1,
  uid,
  typeClass: "Dropdown",
  properties: { optionConfiguration: value, defaultValue: "sales@example.com" },
});
const makeStore = () =>
  configureStore({
    reducer: {
      optionSources: optionSourcesReducer,
      layout: combineReducers({ fields: fieldsReducer }),
    },
  });
type TestState = ReturnType<ReturnType<typeof makeStore>["getState"]>;

const Harness = ({ uid }: { uid: string }) => {
  const dispatch = useDispatch();
  const field = useSelector((state: TestState) =>
    state.layout.fields.find((field) => field.uid === uid),
  );
  if (!field) return null;

  return (
    <Options
      context={field}
      property={property}
      value={field.properties.optionConfiguration}
      updateValue={(value) =>
        dispatch(fieldActions.edit({ uid, handle: property.handle, value }))
      }
    />
  );
};

describe("option source switching", () => {
  let store: ReturnType<typeof makeStore>;
  let root: Root;
  let container: HTMLDivElement;

  const render = (uid: string | null = "first") => {
    act(() => {
      root.render(
        <Provider store={store}>{uid && <Harness uid={uid} />}</Provider>,
      );
    });
  };
  const switchTo = (source: Source) => {
    const button = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === source,
    );
    act(() => button!.click());
  };
  const activeValue = (uid = "first"): OptionsConfiguration =>
    store.getState().layout.fields.find((field) => field.uid === uid)!
      .properties.optionConfiguration;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    store = makeStore();
    store.dispatch(
      fieldActions.set([
        makeField("first", custom),
        makeField("second", elements),
      ]),
    );
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    render();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false });
  });

  it.each([Source.Elements, Source.Predefined])(
    "restores all custom labels, values and flags after visiting %s",
    (source) => {
      switchTo(source);
      switchTo(Source.Custom);
      expect(activeValue()).toEqual(custom);
      expect(sourceProps.value).toEqual(custom);
      expect(sourceProps.defaultValue).toBe("sales@example.com");
    },
  );

  it("remembers each source independently, including its latest edits", () => {
    switchTo(Source.Elements);
    act(() => sourceProps.updateValue(elements));
    switchTo(Source.Predefined);
    act(() => sourceProps.updateValue(predefined));
    switchTo(Source.Custom);
    const edited = {
      ...custom,
      options: [{ label: "New", value: "new@example.com" }],
    };
    act(() => sourceProps.updateValue(edited));
    switchTo(Source.Elements);
    expect(activeValue()).toEqual(elements);
    switchTo(Source.Predefined);
    expect(activeValue()).toEqual(predefined);
    switchTo(Source.Custom);
    expect(activeValue()).toEqual(edited);
    // Only the active configuration is part of the field's save payload.
    expect(store.getState().layout.fields[0]).toEqual(
      makeField("first", edited),
    );
  });

  it("keeps drafts separate across fields and survives closing the editor", () => {
    switchTo(Source.Elements);
    render("second");
    switchTo(Source.Custom);
    expect(activeValue("second")).toEqual({
      source: Source.Custom,
      useCustomValues: false,
      options: [],
    });
    render(null);
    render("first");
    switchTo(Source.Custom);
    expect(activeValue()).toEqual(custom);
    render("second");
    switchTo(Source.Elements);
    expect(activeValue("second")).toEqual(elements);
  });

  it("honors explicit conversion instead of restoring the old custom list", () => {
    switchTo(Source.Elements);
    act(() => sourceProps.updateValue(elements));
    act(() => sourceProps.convertToCustomValues!());
    const converted = {
      source: Source.Custom,
      useCustomValues: true,
      options: [{ label: "Converted", value: "converted@example.com" }],
    };
    expect(activeValue()).toEqual(converted);
    switchTo(Source.Elements);
    expect(activeValue()).toEqual(elements);
    switchTo(Source.Custom);
    expect(activeValue()).toEqual(converted);
  });

  it("does not resurrect options that the editor intentionally deleted", () => {
    switchTo(Source.Elements);
    switchTo(Source.Custom);
    const empty = { ...custom, options: [] };
    act(() => sourceProps.updateValue(empty));
    switchTo(Source.Predefined);
    switchTo(Source.Custom);
    expect(activeValue()).toEqual(empty);
  });

  it("discards old drafts when form fields are loaded again", () => {
    switchTo(Source.Elements);
    act(() => store.dispatch(fieldActions.set([makeField("first", elements)])));
    switchTo(Source.Custom);
    expect(activeValue()).toEqual({
      source: Source.Custom,
      useCustomValues: false,
      options: [],
    });
  });

  it.each([
    fieldActions.remove("first"),
    fieldActions.removeBatch(["first"]),
    fieldActions.batchEdit({ uid: "first", typeClass: "Text", properties: {} }),
  ])("clears drafts when a field is removed or replaced ($type)", (action) => {
    switchTo(Source.Elements);
    render(null);
    act(() => store.dispatch(action));
    expect(store.getState().optionSources.first).toBeUndefined();
  });
});
