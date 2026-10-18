import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import {
  PropertyType,
  type StringProperty,
  type TextareaProperty,
} from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import RefreshIcon from "@ff-icons/actions/refresh";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DiceIcon } from "./dice-icon";
import {
  groupGenerators,
  parseSampleExpression,
  type SampleGenerator,
  sampleExpression,
  sampleParts,
} from "./sample-data";
import { useSampleData } from "./sample-data.context";
import {
  ExpressionModeButton,
  GeneratorButton,
  PickerPanel,
  PickerResults,
  RefreshSamplesButton,
  SampleDefaultInputRow,
  SamplePickerButton,
} from "./sample-data.styles";
import {
  SampleTokenEditor,
  type SampleTokenEditorHandle,
} from "./sample-token-editor";

type Props = ControlType<StringProperty | TextareaProperty> & {
  fieldType: string;
};

export const SampleDataDefault = ({
  property,
  value,
  updateValue,
  errors,
  context,
  fieldType,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rawMode, setRawMode] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const editingToken = useRef<HTMLElement | null>(null);
  const tokenEditor = useRef<SampleTokenEditorHandle>(null);
  const rawInput = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { catalog, loading, error, load, refresh } = useSampleData();
  const {
    refs,
    floatingStyles,
    context: floatingContext,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "right-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 12 })],
  });
  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext, { escapeKey: false });
  const role = useRole(floatingContext, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);
  const closePicker = (focusEditor: boolean) => {
    setOpen(false);
    queueMicrotask(() => {
      if (focusEditor) {
        if (rawMode) rawInput.current?.focus({ preventScroll: true });
        else tokenEditor.current?.focus();
      } else if (refs.domReference.current instanceof HTMLElement)
        refs.domReference.current.focus();
    });
  };
  useEscapeStack(() => closePicker(true), open);
  useEffect(() => {
    if (open) {
      load();
      setSearch("");
    } else {
      editingToken.current = null;
      setEditingId(undefined);
    }
  }, [open, load]);
  const groups = useMemo(
    () =>
      groupGenerators(
        catalog.map((item) => ({ ...item, label: translate(item.label) })),
        fieldType,
        search,
      ),
    [catalog, fieldType, search],
  );
  const selected = editingId ?? parseSampleExpression(value);
  const readonly =
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");

  const choose = (item: SampleGenerator) => {
    if (rawMode) {
      const current = value ?? "";
      const start = rawInput.current?.selectionStart ?? current.length;
      const end = rawInput.current?.selectionEnd ?? start;
      updateValue(
        current.slice(0, start) +
          sampleExpression(item.id) +
          current.slice(end),
      );
    } else tokenEditor.current?.insert(item, editingToken.current);
    closePicker(true);
  };
  const navigate = (event: KeyboardEvent) => {
    const buttons = Array.from(
      resultsRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-generator]",
      ) ?? [],
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    let next: number;
    if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowUp")
      next = (index - 1 + buttons.length) % buttons.length;
    else if (index >= 0 && event.key === "Home") next = 0;
    else if (index >= 0 && event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  };
  const renderGroup = (label: string, items: SampleGenerator[]) =>
    items.length > 0 && (
      <section aria-label={label}>
        <h4>{label}</h4>
        {items.map((item) => (
          <GeneratorButton
            key={item.id}
            type="button"
            data-generator={item.id}
            aria-pressed={selected === item.id}
            onClick={() => choose(item)}
          >
            <span>{item.label}</span>
            <span>{item.value}</span>
          </GeneratorButton>
        ))}
      </section>
    );

  return (
    <Control property={property} context={context} errors={errors}>
      <SampleDefaultInputRow>
        {!rawMode ? (
          <SampleTokenEditor
            ref={tokenEditor}
            value={value ?? ""}
            onChange={updateValue}
            id={property.handle}
            label={translate(property.label ?? "Default value")}
            placeholder={property.placeholder}
            readOnly={readonly}
            multiline={property.type === PropertyType.Textarea}
            onTokenClick={(tag, id) => {
              if (readonly) return;
              editingToken.current = tag;
              setEditingId(id);
              setOpen(true);
            }}
          />
        ) : property.type === PropertyType.Textarea ? (
          <textarea
            ref={(element) => {
              rawInput.current = element;
            }}
            id={property.handle}
            className="text fullwidth"
            rows={property.rows}
            readOnly={readonly}
            value={value ?? ""}
            placeholder={property.placeholder}
            onChange={(event) => updateValue(event.target.value)}
          />
        ) : (
          <input
            ref={(element) => {
              rawInput.current = element;
            }}
            id={property.handle}
            className="text fullwidth"
            type="text"
            autoComplete="off"
            data-1p-ignore
            readOnly={readonly}
            value={value ?? ""}
            placeholder={property.placeholder}
            onChange={(event) => updateValue(event.target.value)}
          />
        )}
        <SamplePickerButton
          type="button"
          ref={refs.setReference}
          disabled={readonly}
          {...getReferenceProps()}
          aria-label={translate("Choose sample data")}
          title={translate("Choose sample data")}
          className="sample-picker-trigger"
        >
          <DiceIcon />
        </SamplePickerButton>
      </SampleDefaultInputRow>
      {(rawMode ||
        sampleParts(String(value ?? "")).some(
          (part) => part.type === "sample",
        )) && (
        <ExpressionModeButton
          type="button"
          onClick={() => {
            const current = rawMode
              ? (value ?? "")
              : (tokenEditor.current?.flush() ?? value ?? "");
            setRawMode(!rawMode);
            queueMicrotask(() => {
              if (rawMode) tokenEditor.current?.focus();
              else {
                rawInput.current?.focus({ preventScroll: true });
                rawInput.current?.setSelectionRange(
                  current.length,
                  current.length,
                );
              }
            });
          }}
        >
          {translate(rawMode ? "Show tokens" : "Edit expression")}
        </ExpressionModeButton>
      )}
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={floatingContext}
            modal={false}
            initialFocus={inputRef}
            returnFocus={false}
          >
            <PickerPanel
              ref={refs.setFloating}
              style={floatingStyles}
              className="dropdown-rollout"
              {...getFloatingProps()}
              aria-label={translate("Choose sample data")}
            >
              <header>
                <div>
                  <h3>{translate("Choose sample data")}</h3>
                  <SamplePickerButton
                    type="button"
                    onClick={() => closePicker(false)}
                    aria-label={translate("Close sample data")}
                  >
                    ×
                  </SamplePickerButton>
                </div>
                <input
                  ref={inputRef}
                  className="text"
                  type="search"
                  placeholder={translate("Search sample data…")}
                  aria-label={translate("Search sample data")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={navigate}
                />
              </header>
              <PickerResults ref={resultsRef} onKeyDown={navigate}>
                {loading && catalog.length === 0 ? (
                  <p role="status">{translate("Loading sample data…")}</p>
                ) : error ? (
                  <div role="alert">
                    <p>{translate("Could not load sample data.")}</p>
                    <SamplePickerButton type="button" onClick={refresh}>
                      {translate("Try again")}
                    </SamplePickerButton>
                  </div>
                ) : (
                  <>
                    {renderGroup(translate("Common choices"), groups.common)}
                    {renderGroup(translate("More generators"), groups.others)}
                    {!groups.common.length && !groups.others.length && (
                      <p>{translate("No matching generators.")}</p>
                    )}
                  </>
                )}
              </PickerResults>
              <footer>
                <span>
                  {translate("Generates a fresh value when the form loads.")}
                </span>
                <RefreshSamplesButton
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                >
                  <RefreshIcon />
                  {translate("Refresh samples")}
                </RefreshSamplesButton>
              </footer>
            </PickerPanel>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </Control>
  );
};
