import { InfoBlock } from "@components/notification-blocks/info/info-block";
import { NativeSlideout } from "@components/slideouts/slideout";
import {
  SlideoutContainer,
  SlideoutFooter,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import { useAppDispatch, useAppSelector } from "@editor/store";
import { applyLabels } from "@editor/store/actions/labels";
import { contextSelectors } from "@editor/store/slices/context/context.selectors";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import {
  type InputHTMLAttributes,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { LabelUpdateConfirmation } from "./label-utility.confirmation";
import { diffLabel } from "./label-utility.diff";
import {
  type Capitalization,
  type ColonStyle,
  collectLabels,
  formatLabel,
} from "./label-utility.operations";
import {
  EmptyPreview,
  FieldTypeFilter,
  LabelTable,
  PreviewHeading,
  UtilityBody,
  UtilityCheckboxWrapper,
  UtilityControls,
  UtilitySection,
  UtilityTrigger,
} from "./label-utility.styles";

const UtilityCheckbox = ({
  children,
  indeterminate = false,
  title,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  children?: ReactNode;
  indeterminate?: boolean;
}) => {
  const id = useId();
  return (
    <UtilityCheckboxWrapper title={title}>
      <input
        {...props}
        id={id}
        type="checkbox"
        className="checkbox"
        ref={(input) => {
          if (input) input.indeterminate = indeterminate;
        }}
      />
      <label htmlFor={id}>{children}</label>
    </UtilityCheckboxWrapper>
  );
};
const diffParts = (parts: ReturnType<typeof diffLabel>["current"]) =>
  parts.map((part) =>
    part.changed ? <mark key={part.offset}>{part.text}</mark> : part.text,
  );
const emptyTypes: FieldType[] = [];
export const LabelUtility = () => {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <UtilityTrigger
        ref={trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {translate("Edit labels")}
      </UtilityTrigger>
      {open && (
        <NativeSlideout
          title={translate("Bulk edit labels")}
          onClose={() => {
            setOpen(false);
            trigger.current?.focus();
          }}
        >
          {(close) => <LabelUtilityEditor close={close} />}
        </NativeSlideout>
      )}
    </>
  );
};

export const LabelUtilityEditor = ({ close }: { close: () => void }) => {
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.layout);
  const translations = useAppSelector((state) => state.translations);
  const translationsEnabled = useAppSelector(
    (state) => state.form.settings.general?.translations,
  );
  const page = useAppSelector(contextSelectors.currentPage);
  const { current, isPrimary } = useSiteContext();
  const { data: types = emptyTypes, isFetching } = useFetchFieldTypes();
  const [scope, setScope] = useState("form");
  const [capitalization, setCapitalization] = useState<Capitalization>("keep");
  const [colons, setColons] = useState<ColonStyle>("keep");
  const [find, setFind] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [cleanSpacing, setCleanSpacing] = useState(false);
  const [preserveAcronyms, setPreserveAcronyms] = useState(true);
  const [excludedTypes, setExcludedTypes] = useState<Set<string>>(
    () => new Set(),
  );
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  const [pending, setPending] =
    useState<{ uid: string; label: string; siteId?: number }[]>();
  const siteId = translationsEnabled && !isPrimary ? current?.id : undefined;
  const { candidates, skipped } = useMemo(
    () =>
      collectLabels({
        ...layout,
        types,
        translations,
        siteId,
        pageUid: scope === "page" ? page?.uid : undefined,
      }),
    [layout, types, translations, siteId, scope, page?.uid],
  );
  const availableTypes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const candidate of candidates)
      counts.set(
        candidate.typeClass,
        (counts.get(candidate.typeClass) ?? 0) + 1,
      );
    return types
      .filter((type) => counts.has(type.typeClass))
      .map((type) => ({
        typeClass: type.typeClass,
        name: translate(type.name),
        count: counts.get(type.typeClass),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [candidates, types]);
  const includedTypeCount = availableTypes.filter(
    (type) => !excludedTypes.has(type.typeClass),
  ).length;
  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) => !excludedTypes.has(candidate.typeClass)),
    [candidates, excludedTypes],
  );
  const proposed = useMemo(
    () =>
      filteredCandidates.flatMap((candidate) => {
        const after = formatLabel(candidate.label, {
          capitalization,
          colons,
          find,
          replacement,
          matchCase,
          cleanSpacing,
          preserveAcronyms,
          locale: document.documentElement.lang || undefined,
        });
        return after !== candidate.label
          ? [{ ...candidate, after, diff: diffLabel(candidate.label, after) }]
          : [];
      }),
    [
      filteredCandidates,
      capitalization,
      colons,
      find,
      replacement,
      matchCase,
      cleanSpacing,
      preserveAcronyms,
    ],
  );
  const changes = proposed.filter((change) => change.after.trim());
  const emptyCount = proposed.length - changes.length;
  const selected = changes.filter((change) => !excluded.has(change.uid));
  const toggle = (uid: string) =>
    setExcluded((previous) => {
      const next = new Set(previous);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  const apply = () => {
    if (!pending?.length) return;
    const groups = new Map<
      number | undefined,
      { uid: string; label: string }[]
    >();
    for (const change of pending)
      groups.set(change.siteId, [
        ...(groups.get(change.siteId) ?? []),
        { uid: change.uid, label: change.label },
      ]);
    // Synchronous dispatches form one undo step, including translated labels.
    for (const [siteId, labels] of groups)
      dispatch(applyLabels({ siteId, labels }));
    setPending(undefined);
    close();
  };
  return (
    <SlideoutContainer>
      <SlideoutHeader>
        <h1>{translate("Bulk edit labels")}</h1>
      </SlideoutHeader>
      <UtilityBody
        onKeyDown={(event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            ["z", "y"].includes(event.key.toLowerCase())
          )
            event.stopPropagation();
        }}
      >
        <p>
          {translate(
            "Update field labels in bulk. Review the changes before applying them.",
          )}{" "}
          {translate("Field handles remain unchanged.")}
        </p>
        {siteId !== undefined && (
          <p className="utility-hint">
            {translate("Editing labels for {site}.", { site: current?.name })}
          </p>
        )}
        <div className="utility-scope">
          <div>
            <label htmlFor="label-utility-scope">{translate("Apply to")}</label>
            <div className="select">
              <select
                id="label-utility-scope"
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              >
                <option value="form">{translate("Entire form")}</option>
                <option value="page" disabled={!page}>
                  {translate("Current page")}
                </option>
              </select>
            </div>
          </div>
        </div>
        <UtilitySection aria-labelledby="label-utility-formatting">
          <h2 id="label-utility-formatting">{translate("Formatting")}</h2>
          <UtilityControls>
            <div>
              <label htmlFor="label-utility-case">
                {translate("Capitalization")}
              </label>
              <div className="select">
                <select
                  id="label-utility-case"
                  value={capitalization}
                  onChange={(event) =>
                    setCapitalization(event.target.value as Capitalization)
                  }
                >
                  <option value="keep">
                    {translate("Keep capitalization")}
                  </option>
                  <option value="sentence">{translate("Sentence case")}</option>
                  <option value="title">{translate("Title Case")}</option>
                  <option value="upper">{translate("UPPERCASE")}</option>
                  <option value="lower">{translate("lowercase")}</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="label-utility-colons">
                {translate("Trailing colons")}
              </label>
              <div className="select">
                <select
                  id="label-utility-colons"
                  value={colons}
                  onChange={(event) =>
                    setColons(event.target.value as ColonStyle)
                  }
                >
                  <option value="keep">{translate("Keep colons")}</option>
                  <option value="add">{translate("Add colons")}</option>
                  <option value="remove">{translate("Remove colons")}</option>
                </select>
              </div>
            </div>
          </UtilityControls>
          <div className="utility-formatting-options">
            {["sentence", "title"].includes(capitalization) && (
              <UtilityCheckbox
                title={translate(
                  "Keep existing acronyms such as ID, URL, PDF and ZIP uppercase.",
                )}
                checked={preserveAcronyms}
                onChange={(event) => setPreserveAcronyms(event.target.checked)}
              >
                {translate("Preserve common acronyms")}
              </UtilityCheckbox>
            )}
            <UtilityCheckbox
              title={translate(
                "Trim leading and trailing spaces and collapse repeated spaces.",
              )}
              checked={cleanSpacing}
              onChange={(event) => setCleanSpacing(event.target.checked)}
            >
              {translate("Clean up spacing")}
            </UtilityCheckbox>
          </div>
        </UtilitySection>
        <UtilitySection aria-labelledby="label-utility-replace-heading">
          <h2 id="label-utility-replace-heading">
            {translate("Find and replace")}
          </h2>
          <UtilityControls>
            <div className="utility-replace">
              <div>
                <label htmlFor="label-utility-find">
                  {translate("Find text")}
                </label>
                <input
                  id="label-utility-find"
                  type="text"
                  className="text fullwidth"
                  value={find}
                  onChange={(event) => setFind(event.target.value)}
                  autoComplete="off"
                />
                <UtilityCheckbox
                  checked={matchCase}
                  onChange={(event) => setMatchCase(event.target.checked)}
                >
                  {translate("Match case")}
                </UtilityCheckbox>
              </div>
              <div>
                <label htmlFor="label-utility-replacement">
                  {translate("Replace with")}
                </label>
                <input
                  id="label-utility-replacement"
                  type="text"
                  className="text fullwidth"
                  value={replacement}
                  onChange={(event) => setReplacement(event.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </UtilityControls>
        </UtilitySection>
        {availableTypes.length > 0 && (
          <FieldTypeFilter aria-labelledby="label-utility-field-types">
            <summary>
              <span id="label-utility-field-types">
                {translate("Field types")}
              </span>
              <span className="utility-types-summary">
                {" · "}
                {translate(
                  includedTypeCount === availableTypes.length
                    ? "All types"
                    : "{count} of {total} types",
                  { count: includedTypeCount, total: availableTypes.length },
                )}
              </span>
            </summary>
            <div className="utility-types-body">
              <div className="utility-types-heading">
                <button
                  type="button"
                  className="utility-select-types"
                  onClick={() =>
                    setExcludedTypes(
                      includedTypeCount === availableTypes.length
                        ? new Set(availableTypes.map((type) => type.typeClass))
                        : new Set(),
                    )
                  }
                >
                  {translate(
                    includedTypeCount === availableTypes.length
                      ? "Deselect All"
                      : "Select All",
                  )}
                </button>
              </div>
              <div className="utility-types">
                {availableTypes.map((type) => (
                  <UtilityCheckbox
                    key={type.typeClass}
                    value={type.typeClass}
                    aria-label={translate("Include {type} labels", {
                      type: type.name,
                    })}
                    checked={!excludedTypes.has(type.typeClass)}
                    onChange={() =>
                      setExcludedTypes((previous) => {
                        const next = new Set(previous);
                        if (next.has(type.typeClass))
                          next.delete(type.typeClass);
                        else next.add(type.typeClass);
                        return next;
                      })
                    }
                  >
                    {type.name}{" "}
                    <span className="utility-type-count">({type.count})</span>
                  </UtilityCheckbox>
                ))}
              </div>
            </div>
          </FieldTypeFilter>
        )}
        {colons === "add" && (
          <p className="utility-hint">
            {translate(
              "Labels ending in a question mark or exclamation mark keep their punctuation.",
            )}
          </p>
        )}
        <PreviewHeading>
          <h2>{translate("Preview changes")}</h2>
          <span role="status">
            {translate(
              selected.length === 1
                ? "1 label selected"
                : "{count} labels selected",
              { count: selected.length },
            )}
          </span>
        </PreviewHeading>
        {changes.length ? (
          <LabelTable>
            <thead>
              <tr>
                <th>
                  <UtilityCheckbox
                    aria-label={translate("Select all label changes")}
                    checked={selected.length === changes.length}
                    indeterminate={
                      selected.length > 0 && selected.length < changes.length
                    }
                    onChange={(event) =>
                      setExcluded(
                        event.target.checked
                          ? new Set()
                          : new Set(changes.map((change) => change.uid)),
                      )
                    }
                  />
                </th>
                <th scope="col">{translate("Current label")}</th>
                <th scope="col">{translate("Updated label")}</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => (
                <tr key={change.uid} data-selected={!excluded.has(change.uid)}>
                  <td>
                    <UtilityCheckbox
                      aria-label={translate("Update label: {label}", {
                        label: change.label,
                      })}
                      checked={!excluded.has(change.uid)}
                      onChange={() => toggle(change.uid)}
                    />
                  </td>
                  <td>
                    <span className="utility-label utility-label-current">
                      {diffParts(change.diff.current)}
                    </span>
                    <small>
                      {change.page}
                      {change.handle && ` · ${change.handle}`}
                    </small>
                  </td>
                  <td>
                    <span className="utility-label utility-label-updated">
                      {diffParts(change.diff.next)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </LabelTable>
        ) : (
          <EmptyPreview>
            {translate(
              isFetching
                ? "Loading labels…"
                : !candidates.length
                  ? "No editable text labels found."
                  : !filteredCandidates.length
                    ? "No labels match the selected field types."
                    : emptyCount > 0
                      ? "No non-empty label changes to apply."
                      : capitalization === "keep" &&
                          colons === "keep" &&
                          !find &&
                          !cleanSpacing
                        ? "Choose a formatting option to preview changes."
                        : "All editable labels already match these settings.",
            )}
          </EmptyPreview>
        )}
        {emptyCount > 0 && (
          <p className="utility-hint">
            {translate(
              emptyCount === 1
                ? "One change would leave an empty label and is excluded."
                : "{count} changes would leave an empty label and are excluded.",
              { count: emptyCount },
            )}
          </p>
        )}
        {skipped > 0 && (
          <p className="utility-hint">
            {translate("{count} labels containing HTML or Twig are excluded.", {
              count: skipped,
            })}
          </p>
        )}
        <InfoBlock>
          {translate(
            "You can undo this update in one step. Save the form when you’re happy with the result.",
          )}
        </InfoBlock>
      </UtilityBody>
      <SlideoutFooter>
        <button type="button" className="btn" onClick={close}>
          {translate("Cancel")}
        </button>
        <button
          type="button"
          className="btn submit"
          disabled={!selected.length || isFetching}
          onClick={() =>
            setPending(
              selected.map((change) => ({
                uid: change.uid,
                label: change.after,
                siteId: change.siteId,
              })),
            )
          }
        >
          {translate("Update labels ({count})", { count: selected.length })}
        </button>
      </SlideoutFooter>
      {pending && (
        <LabelUpdateConfirmation
          count={pending.length}
          onCancel={() => setPending(undefined)}
          onConfirm={apply}
        />
      )}
    </SlideoutContainer>
  );
};
