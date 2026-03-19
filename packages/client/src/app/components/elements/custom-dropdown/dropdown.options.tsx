import type { OptionCollection } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import DOMPurify from "dompurify";
import { type FC, useEffect, useRef } from "react";
import CheckIcon from "./check";
import type { DropdownProps } from "./dropdown";
import {
  CheckMark,
  Item,
  Label,
  LabelContainer,
  LabelValueDisplay,
  List,
} from "./dropdown.options.styles";
import { OptionIcon } from "./dropdown.styles";

type Props = DropdownProps & {
  focusIndex: number;
  query?: string;
  showValues?: boolean;
  showHints?: boolean;
};

export const Options: FC<Props> = ({
  value: selectedValue,
  options,
  query,
  focusIndex,
  showValues,
  showHints,
  onChange,
}) => {
  const optionRefs = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    if (optionRefs.current[focusIndex]) {
      optionRefs.current[focusIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusIndex]);

  return (
    <List>
      {options?.map((option, idx) => {
        let value: string;
        let hint: string;
        let shadowIndex: number;

        if ("value" in option) {
          value = option.value;
          shadowIndex = option.shadowIndex;
        }

        if ("hint" in option) {
          hint = option.hint;
        }

        let children: OptionCollection;
        if ("children" in option) {
          children = option.children;
        }

        return (
          <Item
            ref={(el) => {
              if (shadowIndex !== undefined) {
                optionRefs.current[shadowIndex] = el;
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (value !== undefined && onChange) {
                onChange(value);
              }
            }}
            key={idx}
            className={classes(
              children !== undefined && "has-children",
              value === selectedValue && "selected",
              value === "" && "empty",
              shadowIndex === focusIndex && "focused",
            )}
          >
            <Label
              className={classes(children !== undefined && "has-children")}
              data-value={value}
            >
              {!children && selectedValue === value && (
                <CheckMark>
                  <CheckIcon />
                </CheckMark>
              )}

              <LabelContainer>
                {option.icon && <OptionIcon>{option.icon}</OptionIcon>}
                <div>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(option.label),
                    }}
                  />
                </div>
              </LabelContainer>

              {!showValues && showHints && hint && (
                <LabelValueDisplay>{hint}</LabelValueDisplay>
              )}

              {showValues &&
                value !== "" &&
                value !== undefined &&
                value !== null &&
                value !== option.label && (
                  <LabelValueDisplay>{value}</LabelValueDisplay>
                )}
            </Label>

            {children && (
              <Options
                options={children}
                value={selectedValue}
                query={query}
                focusIndex={focusIndex}
                onChange={onChange}
                showHints={showHints}
                showValues={showValues}
              />
            )}
          </Item>
        );
      })}
    </List>
  );
};
