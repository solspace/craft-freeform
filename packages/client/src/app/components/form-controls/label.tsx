import { colors } from "@ff-client/styles/variables";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import TranslateIcon from "@ff-icons/translate.icon.svg";
import type React from "react";

import {
  Label,
  LabelText,
  RequiredStar,
  TranslateIconWrapper,
} from "./label.styles";

type Props = {
  label: string;
  handle: string;
  required?: boolean;
  translatable?: boolean;
  hasTranslation?: boolean;
  isEncrypted?: boolean;
  removeTranslation?: () => void;
};

const FormLabel: React.FC<Props> = ({
  label,
  handle,
  required,
  translatable,
  hasTranslation,
  isEncrypted,
  removeTranslation,
}) => {
  if (!label) {
    return null;
  }

  return (
    <Label className={classes(required && "is-required")} htmlFor={handle}>
      <LabelText>{translate(label)}</LabelText>
      {required && <RequiredStar />}
      {isEncrypted && (
        <i
          className="fa-solid fa-shield-alt"
          style={{ color: colors.blue500 }}
          title={translate("This field is encrypted.")}
        />
      )}
      {translatable && (
        <TranslateIconWrapper
          className={classes(hasTranslation && "active")}
          title={hasTranslation ? translate("Remove translation") : undefined}
          onClick={() => {
            if (
              hasTranslation &&
              confirm(
                translate("Are you sure you want to remove the translation?"),
              )
            ) {
              removeTranslation?.();
            }
          }}
        >
          <TranslateIcon />
        </TranslateIconWrapper>
      )}
    </Label>
  );
};

export default FormLabel;
