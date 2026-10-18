import { Tooltip } from "@components/elements/tooltip/tooltip";
import SpinnerIcon from "@components/loaders/spinner";
import { DiceIcon } from "@editor/builder/sample-data/dice-icon";
import { type RootState, useAppDispatch } from "@editor/store";
import { contextActions, FocusType } from "@editor/store/slices/context";
import { contextSelectors } from "@editor/store/slices/context/context.selectors";
import type { Field } from "@editor/store/slices/layout/fields";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { useFieldType } from "@ff-client/queries/field-types";
import { Fields } from "@ff-client/types/field.classes";
import { Type } from "@ff-client/types/fields";
import classes from "@ff-client/utils/classes";
import { hasErrors } from "@ff-client/utils/errors";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import { memo, useMemo } from "react";
import { useSelector } from "react-redux";

import { GroupFieldLayout } from "../../layout/group-field-layout/group-field-layout";

import { useLoaderAnimation } from "./cell.animations";
import {
  FieldCellWrapper,
  HtmlPreviewElement,
  Icon,
  Instructions,
  Label,
  LabelIcon,
  LabelText,
  Row,
  SampleValueMarker,
} from "./cell.styles";
import { useFieldPreview } from "./use-field-preview";

type Props = {
  field: Field;
};

export const FieldCell: React.FC<Props> = memo(({ field }) => {
  const dispatch = useAppDispatch();
  const type = useFieldType(field?.typeClass);
  const { uid } = field;

  const isActive = useSelector((state: RootState) => {
    const focus = contextSelectors.focus(state);
    return focus.active && focus.type === FocusType.Field && focus.uid === uid;
  });
  const noLabel = useMemo(
    () => type?.implements?.includes("noLabel") || false,
    [type],
  );

  const [preview, isLoadingPreview, sample] = useFieldPreview(field, type);
  const [spinnerAnimation, iconAnimation] =
    useLoaderAnimation(isLoadingPreview);

  const { getTranslation } = useTranslations(field);
  const previewMarkup = useMemo(
    () => ({ __html: DOMPurify.sanitize(preview) }),
    [preview],
  );
  const isContentField = type?.type === "html" || type?.type === "rich-text";
  const content = getTranslation("content", field.properties?.content);
  const contentPreview = useMemo(() => {
    // Empty preview templates include placeholder text, which is not field content.
    if (!isContentField || typeof content !== "string" || !content.trim()) {
      return { hasContent: false, hasHeading: false };
    }

    const body = new DOMParser().parseFromString(
      previewMarkup.__html,
      "text/html",
    ).body;
    return {
      hasContent:
        !!body.textContent?.trim() ||
        !!body.querySelector(
          "img, svg, video, audio, hr, table, canvas, input, button, select, textarea",
        ),
      hasHeading: !!body.querySelector("h1, h2, h3, h4, h5, h6"),
    };
  }, [isContentField, content, previewMarkup]);
  const hasContentPreview = contentPreview.hasContent;
  const hideLabel = noLabel || hasContentPreview;
  const iconMarkup = useMemo(
    () => ({ __html: DOMPurify.sanitize(type?.icon || "") }),
    [type?.icon],
  );

  if (field?.properties === undefined || !type) {
    return null;
  }

  const label = getTranslation("label", field.properties.label || type?.name);
  const instructions = getTranslation(
    "instructions",
    field.properties.instructions,
  );
  const PreviewElement =
    field.typeClass === Fields.Html || field.typeClass === Fields.RichText
      ? HtmlPreviewElement
      : "div";

  const sampleMarker = sample ? (
    <SampleValueMarker $select={type.type === "dropdown"}>
      <Tooltip
        title={translate("Sample data: {generator}", {
          generator: translate(sample.label),
        })}
      >
        <button
          type="button"
          aria-label={translate("Sample data: {generator}", {
            generator: translate(sample.label),
          })}
        >
          <DiceIcon />
        </button>
      </Tooltip>
    </SampleValueMarker>
  ) : null;

  return (
    <FieldCellWrapper
      data-field-uid={uid}
      data-field-type={type.type}
      className={classes(
        hasErrors(field.errors) && "errors",
        type.type === Type.Group && "group",
        hasContentPreview && "content-only",
        contentPreview.hasHeading && "section-heading",
        isActive && "active",
        "field",
      )}
      onClick={(event): void => {
        event.stopPropagation();
        dispatch(contextActions.setFocusedItem({ type: FocusType.Field, uid }));
      }}
    >
      {!hideLabel && (
        <Label className="label">
          <LabelText>
            {label}
            {field.properties.required && (
              <span className="field-required" aria-hidden="true">
                *
              </span>
            )}
          </LabelText>
          <LabelIcon aria-hidden="true" data-loading={isLoadingPreview}>
            {isLoadingPreview && (
              <Icon style={spinnerAnimation}>
                <SpinnerIcon />
              </Icon>
            )}
            <Icon style={iconAnimation} dangerouslySetInnerHTML={iconMarkup} />
          </LabelIcon>
        </Label>
      )}

      {instructions && <Instructions>{instructions}</Instructions>}

      {type.type === Type.Group && (
        <GroupFieldLayout field={field} layoutUid={field.properties?.layout} />
      )}

      {type.type !== Type.Group &&
        (hideLabel ? (
          <Row className={sample ? "sample-preview" : undefined}>
            <HtmlPreviewElement
              className={hasContentPreview ? "content-preview" : undefined}
              $fullWidth={hasContentPreview}
              dangerouslySetInnerHTML={previewMarkup}
            />
            {sampleMarker}
          </Row>
        ) : (
          <div className={sample ? "sample-preview" : undefined}>
            <PreviewElement dangerouslySetInnerHTML={previewMarkup} />
            {sampleMarker}
          </div>
        ))}
    </FieldCellWrapper>
  );
});

FieldCell.displayName = "FieldCell";
