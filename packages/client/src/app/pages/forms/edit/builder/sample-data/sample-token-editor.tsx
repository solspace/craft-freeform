import translate from "@ff-client/utils/translations";
import type Tagify from "@yaireo/tagify";
import { MixedTags } from "@yaireo/tagify/dist/react.tagify.jsx";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type SampleGenerator,
  sampleExpression,
  sampleParts,
} from "./sample-data";
import { useSampleData } from "./sample-data.context";
import { SampleTokenWrapper } from "./sample-data.styles";
import {
  encodeSampleTokens,
  hasUntokenizedSamples,
  sampleTokenDelimiters,
  serializeSampleTokens,
} from "./sample-tokens";

import "@yaireo/tagify/dist/tagify.css";

export type SampleTokenEditorHandle = {
  insert: (generator: SampleGenerator, replacing?: HTMLElement | null) => void;
  flush: () => string;
  focus: () => void;
};
type Props = {
  value: string;
  onChange: (value: string) => void;
  onTokenClick: (tag: HTMLElement, id: string) => void;
  id: string;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  multiline: boolean;
};

export const SampleTokenEditor = forwardRef<SampleTokenEditorHandle, Props>(
  (
    {
      value,
      onChange,
      onTokenClick,
      id,
      label,
      placeholder,
      readOnly,
      multiline,
    },
    ref,
  ) => {
    const { catalog, load } = useSampleData();
    const localized = useMemo(
      () =>
        new Map(
          catalog.map((item) => [
            item.id,
            { ...item, label: translate(item.label) },
          ]),
        ),
      [catalog],
    );
    const tagifyRef = useRef<Tagify>(null);
    const lastCatalog = useRef(localized);
    const valueRef = useRef(value);
    valueRef.current = value;
    const [mixed, setMixed] = useState(() =>
      encodeSampleTokens(value, localized),
    );

    const hasSample = useMemo(
      () => sampleParts(value).some((part) => part.type === "sample"),
      [value],
    );
    useEffect(() => {
      if (hasSample) load();
    }, [hasSample, load]);
    useEffect(() => {
      const input = tagifyRef.current?.DOM.input;
      if (input) {
        input.id = id;
        input.setAttribute("aria-label", label);
        input.setAttribute("aria-multiline", String(multiline));
        input.spellcheck = false;
      }
    }, [id, label, multiline]);

    const commit = useCallback(() => {
      const current = tagifyRef.current?.getMixedTagsAsString();
      if (current === undefined) return valueRef.current;
      const serialized = serializeSampleTokens(current);
      setMixed(current);
      if (serialized !== valueRef.current) {
        valueRef.current = serialized;
        onChange(serialized);
      }
      return serialized;
    }, [onChange]);

    useEffect(() => {
      const tagify = tagifyRef.current;
      if (
        tagify &&
        serializeSampleTokens(tagify.getMixedTagsAsString()) === value &&
        lastCatalog.current === localized
      )
        return;
      lastCatalog.current = localized;
      setMixed(encodeSampleTokens(value, localized));
    }, [value, localized]);

    useImperativeHandle(
      ref,
      () => ({
        flush: commit,
        focus: () =>
          tagifyRef.current?.DOM.input.focus({ preventScroll: true }),
        insert: (generator, replacing) => {
          const tagify = tagifyRef.current;
          if (!tagify || readOnly) return;
          const data = {
            value: generator.id,
            label: translate(generator.label),
            expression: sampleExpression(generator.id),
          };
          if (replacing && tagify.DOM.input.contains(replacing))
            tagify.replaceTag(replacing, data);
          else tagify.addMixTags([data]);
          commit();
        },
      }),
      [commit, readOnly],
    );

    return (
      <SampleTokenWrapper $multiline={multiline}>
        <MixedTags
          tagifyRef={tagifyRef}
          value={mixed}
          readOnly={readOnly}
          autoFocus={false}
          placeholder={placeholder}
          settings={{
            pattern: /$^/,
            tagTextProp: "label",
            mixTagsInterpolator: sampleTokenDelimiters,
            mixMode: { insertAfterTag: "" },
            enforceWhitelist: true,
            duplicates: true,
            editTags: false,
            pasteAsTags: false,
            dropdown: { enabled: -1 },
            a11y: { focusableTags: true },
            hooks: {
              beforeKeyDown: (event) => {
                const tagify = tagifyRef.current;
                const target = event.target;
                if (
                  tagify &&
                  target instanceof HTMLElement &&
                  target.classList.contains("tagify__tag") &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  const index = tagify.getTagElms().indexOf(target);
                  const data = tagify.value[index];
                  if (data) onTokenClick(target, data.value);
                  return Promise.reject();
                }
                if (
                  !multiline &&
                  event.key === "Enter" &&
                  target === tagify?.DOM.input
                ) {
                  event.preventDefault();
                  return Promise.reject();
                }
                return Promise.resolve();
              },
            },
          }}
          whitelist={Array.from(localized.values()).map((item) => ({
            value: item.id,
            label: item.label,
          }))}
          onChange={commit}
          onInput={commit}
          onClick={(event: CustomEvent<Tagify.ClickEventData>) =>
            onTokenClick(event.detail.tag, event.detail.data.value)
          }
          onKeydown={(event: CustomEvent<Tagify.KeyboardEventData>) => {
            if (
              !multiline &&
              event.detail.event.key === "Enter" &&
              event.detail.event.target === tagifyRef.current?.DOM.input
            )
              event.detail.event.preventDefault();
          }}
          onBlur={() => {
            const serialized = commit();
            const current = tagifyRef.current?.getMixedTagsAsString() ?? "";
            if (hasUntokenizedSamples(current, localized))
              setMixed(encodeSampleTokens(serialized, localized));
          }}
          name={id}
        />
      </SampleTokenWrapper>
    );
  },
);
SampleTokenEditor.displayName = "SampleTokenEditor";
