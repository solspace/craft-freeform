import { ButtonGroup as AlignmentButtons } from "@components/elements/button-group/button-group";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { Page } from "@editor/builder/types/layout";
import type { PageButtonsLayoutProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import isEqual from "lodash/isEqual";
import type React from "react";
import { type ReactNode, useId } from "react";

import BackIcon from "./icons/back";
import SaveIcon from "./icons/save";
import SubmitIcon from "./icons/submit";
import { layoutAlignment, pageButtonLayoutChoices } from "./layout.operations";
import {
  AlignmentControl,
  Button,
  ButtonGroup,
  ButtonLayoutWrapper,
  LayoutBlock,
  OrderControl,
  OrderLabel,
} from "./layout.styles";

const icons: Record<string, ReactNode> = {
  save: <SaveIcon />,
  back: <BackIcon />,
  submit: <SubmitIcon />,
};

type ComponentType = ControlType<PageButtonsLayoutProperty, Page>;

const PageButtonLayout: React.FC<ComponentType> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const id = useId();
  const { layouts } = property;
  const { items, selected, alignment } = pageButtonLayoutChoices(
    layouts,
    value,
    context,
  );
  const orderChoices = items.filter(
    (item) => layoutAlignment(item.groups) === alignment,
  );
  const labels: Record<string, string> = {
    save: translate("Save"),
    back: translate("Back"),
    submit: translate("Submit"),
  };
  const alignmentLabels: Record<string, string> = {
    split: translate("Split"),
    left: translate("Left"),
    center: translate("Center"),
    right: translate("Right"),
  };

  return (
    <Control property={property} errors={errors}>
      <AlignmentControl>
        <AlignmentButtons
          label={property.label}
          value={alignment}
          stacked
          disabled={property.disabled}
          options={Object.entries(alignmentLabels)
            .map(([value, label]) => ({ value, label }))
            .filter((option) =>
              items.some(
                (item) => layoutAlignment(item.groups) === option.value,
              ),
            )}
          renderIcon={(alignment) => (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <path
                strokeLinecap="round"
                d={
                  {
                    split: "M3 12h6m-3-3-3 3 3 3M21 12h-6m3-3 3 3-3 3",
                    left: "M4 5h16M4 10h10M4 15h16M4 20h10",
                    center: "M4 5h16M7 10h10M4 15h16M7 20h10",
                    right: "M4 5h16M10 10h10M4 15h16M10 20h10",
                  }[alignment]
                }
              />
            </svg>
          )}
          onClick={(alignment) => {
            const matches = items.filter(
              (item) => layoutAlignment(item.groups) === alignment,
            );
            const sameOrder =
              selected &&
              matches.find((item) =>
                isEqual(item.groups.flat(), selected.groups.flat()),
              );
            updateValue((sameOrder || matches[0]).layout);
          }}
        />
      </AlignmentControl>
      {orderChoices.length > 1 && (
        <OrderControl>
          <OrderLabel>{translate("Button order")}</OrderLabel>
          <ButtonLayoutWrapper
            role="radiogroup"
            aria-label={translate("Button order")}
          >
            {orderChoices.map((item) => {
              const description = item.groups
                .map((buttons) =>
                  buttons.map((button) => labels[button]).join(", "),
                )
                .filter(Boolean)
                .join(" / ");
              return (
                <LayoutBlock key={item.layout}>
                  <input
                    type="radio"
                    name={id}
                    value={item.layout}
                    checked={selected?.layout === item.layout}
                    disabled={property.disabled}
                    aria-label={`${alignmentLabels[alignment]}: ${description}`}
                    onChange={() => updateValue(item.layout)}
                  />
                  <span className="layout-preview" aria-hidden="true">
                    {item.groups.map((buttons, groupIdx) => (
                      <ButtonGroup key={groupIdx}>
                        {buttons.map((button) => (
                          <Button className={button} key={button}>
                            {icons[button]}
                            <span>{labels[button]}</span>
                          </Button>
                        ))}
                      </ButtonGroup>
                    ))}
                  </span>
                </LayoutBlock>
              );
            })}
          </ButtonLayoutWrapper>
        </OrderControl>
      )}
    </Control>
  );
};

export default PageButtonLayout;
