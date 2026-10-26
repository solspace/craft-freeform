import {
  RenderContextProvider,
  useRenderContext,
} from "@components/form-controls/context/render.context";
import { ControlBlock } from "@components/form-controls/control.block";
import { useVisibility } from "@components/form-controls/hooks/use-visibility";
import {
  componentDesignAppearance,
  designedCardAppearance,
} from "@editor/builder/tabs/layout/field-layout/layout/columns-layout/component-design";
import { useAppDispatch, useAppSelector } from "@editor/store";
import { type Field, fieldActions } from "@editor/store/slices/layout/fields";
import PencilIcon from "@ff-client/assets/icons/actions/pencil";
import ResetIcon from "@ff-client/assets/icons/actions/refresh";
import { colors } from "@ff-client/styles/variables";
import type { Property } from "@ff-client/types/properties";
import {
  designOverrideGroup,
  editableComponentDesign,
  hasDesignOverride,
  inheritedDesignSettings,
} from "@ff-client/utils/component-design-settings";
import translate from "@ff-client/utils/translations";
import type React from "react";
import styled from "styled-components";

const Action = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-sizing: border-box;
  height: 24px;
  padding: 0 7px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: ${colors.link};
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  svg { display: block; flex: none; width: 12px; height: 12px; }
  &:hover { background: var(--ui-control-bg-color); text-decoration: underline; }
  &:focus-visible { outline: 2px solid ${colors.blue800}; outline-offset: 2px; }
`;
const Inherited = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid ${colors.inputBorder};
  border-radius: 3px;
  background: ${colors.white};
  color: ${colors.gray700};
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  i { width: 18px; height: 18px; flex: 0 0 18px; border: 1px solid ${colors.inputBorder}; border-radius: 3px; }
  small { margin-left: auto; color: ${colors.gray550}; font-size: 10px; font-weight: 400; white-space: nowrap; }
  svg { display: block; flex: none; width: 12px; height: 12px; color: ${colors.gray400}; }
  &:hover { border-color: ${colors.gray350}; background: ${colors.gray050}; }
  &:focus-visible { outline: 2px solid ${colors.blue800}; outline-offset: 2px; }

`;

const styleVariables: Record<string, string> = {
  background: "--freeform-background-color",
  padding: "--freeform-padding",
  minHeight: "--freeform-min-height",
  textColor: "--freeform-text-color",
  sectionRadiusPreset: "--freeform-component-radius",
  gap: "--freeform-component-gap",
  cardBackgroundColor: "--freeform-card-background",
  cardTextColor: "--freeform-card-color",
  cardBorderColor: "--freeform-card-border-color",
  cardBorderWidthPreset: "--freeform-card-border-width",
  cardRadiusPreset: "--freeform-card-radius",
  cardPadding: "--freeform-card-padding",
};

export const LayoutDesignProperty: React.FC<
  React.PropsWithChildren<{ field: Field; property: Property }>
> = ({ field, property, children }) => {
  const dispatch = useAppDispatch();
  const render = useRenderContext();
  const form = useAppSelector((state) => state.form.settings.general ?? {});
  const properties = editableComponentDesign(field.properties);
  const { handle } = property;
  const visible = useVisibility(property.visibilityFilters ?? [], {
    ...field,
    properties,
  } as never);
  if (!visible) return null;
  if (
    properties.designStyle !== "custom" ||
    designOverrideGroup(handle) !== handle
  )
    return children;
  const overridden = hasDesignOverride(properties, handle);
  const inherited = inheritedDesignSettings(form);
  const following = {
    ...properties,
    designOverrides: (properties.designOverrides as string[]).filter(
      (item) => item !== designOverrideGroup(handle),
    ),
  };
  const design = componentDesignAppearance(following, form);
  const styles = {
    ...design,
    ...designedCardAppearance(following, design),
  };
  const value = String(
    inherited[handle] ?? styles[styleVariables[handle]] ?? "",
  );
  const tint = (accent: string): string => {
    const hex = accent.slice(1).split("");
    const expanded =
      hex.length === 3 ? hex.map((char) => char + char).join("") : hex.join("");
    return `#${[0, 2, 4]
      .map((offset) =>
        Math.round(parseInt(expanded.slice(offset, offset + 2), 16) * 0.2 + 204)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
  };
  const overrideValue = value.startsWith("color-mix(")
    ? tint(design["--freeform-accent-color"])
    : value;
  const caption = value.startsWith("color-mix(")
    ? translate("Accent tint")
    : translate(value.charAt(0).toUpperCase() + value.slice(1));
  const editSetting = () => {
    if (!overridden && handle === "background") {
      dispatch(
        fieldActions.editDesign({
          uid: field.uid,
          handle: "backgroundColor",
          value: design["--freeform-background-color"],
        }),
      );
      dispatch(
        fieldActions.editDesign({ uid: field.uid, handle, value: "color" }),
      );
    } else if (
      !overridden &&
      [
        "cardRadiusPreset",
        "sectionRadiusPreset",
        "padding",
        "cardPadding",
        "gap",
      ].includes(handle)
    ) {
      dispatch(
        fieldActions.editDesign({
          uid: field.uid,
          handle: {
            cardRadiusPreset: "cardRadius",
            sectionRadiusPreset: "sectionRadius",
            padding: "customPadding",
            cardPadding: "customCardPadding",
            gap: "customGap",
          }[handle],
          value: parseInt(value, 10),
        }),
      );
      dispatch(
        fieldActions.editDesign({
          uid: field.uid,
          handle,
          value: "custom",
        }),
      );
    } else {
      dispatch(
        fieldActions.editDesign({
          uid: field.uid,
          handle,
          value:
            inherited[handle] ??
            (handle === "cardBorderWidthPreset"
              ? "one"
              : handle === "minHeight"
                ? parseInt(value, 10)
                : styleVariables[handle]
                  ? overrideValue
                  : properties[handle]),
          reset: overridden,
        }),
      );
    }
  };
  const action = (
    <Action
      type="button"
      title={translate("Reset {label} to form setting", {
        label: translate(property.label),
      })}
      aria-label={translate("Reset {label} to form setting", {
        label: translate(property.label),
      })}
      onClick={editSetting}
    >
      <ResetIcon aria-hidden="true" />
      <span>{translate("Reset")}</span>
    </Action>
  );
  if (!overridden)
    return (
      <ControlBlock
        label={property.label}
        handle={handle}
        errors={field.errors?.[handle]}
      >
        <Inherited
          type="button"
          aria-label={translate("Customize {label}", {
            label: translate(property.label),
          })}
          title={translate("Customize {label}", {
            label: translate(property.label),
          })}
          onClick={editSetting}
        >
          {/^#[a-f0-9]{3,6}$/i.test(value) && (
            <i style={{ backgroundColor: value }} aria-hidden="true" />
          )}
          <span>{caption}</span>
          <small>
            {translate(handle in inherited ? "Form setting" : "Automatic")}
          </small>
          <PencilIcon aria-hidden="true" />
        </Inherited>
      </ControlBlock>
    );
  return (
    <RenderContextProvider
      {...render}
      controlActions={{ ...render.controlActions, [handle]: action }}
    >
      {children}
    </RenderContextProvider>
  );
};
