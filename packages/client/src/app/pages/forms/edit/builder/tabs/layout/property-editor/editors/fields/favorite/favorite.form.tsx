import { ApiErrorsBlock } from "@components/errors/api-errors";
import { ControlWrapper } from "@components/form-controls/control.styles";
import StringInput from "@components/form-controls/control-types/string/string";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import type { Field } from "@editor/store/slices/layout/fields";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect, useState } from "react";

import { ButtonContainer, FavoriteFormWrapper } from "./favorite.form.styles";
import type { FavoriteMutationResult } from "./favorite.queries";

type Props = {
  field: Field;
  type: FieldType;
  mutation: FavoriteMutationResult;
};

export const FavoriteForm: React.FC<Props> = ({ field, type, mutation }) => {
  const [label, setLabel] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to reset the label when the field changes, not when the type changes
  useEffect(() => {
    setLabel(field.properties.label || type?.name);
    mutation.reset();
  }, [field.uid, type?.name]);

  return (
    <FavoriteFormWrapper>
      <ControlWrapper>
        <StringInput
          property={{
            label: translate("Create a favorite"),
            handle: field.properties?.handle,
            flags: [],
            placeholder: field.properties?.label,
            type: PropertyType.String,
          }}
          value={label}
          updateValue={(value) => setLabel(value)}
        />
      </ControlWrapper>
      <ButtonContainer>
        <button
          type="button"
          disabled={mutation.isPending}
          className={classes(
            "btn fullwidth",
            !mutation.isSuccess && "submit",
            mutation.isPending && "disabled",
          )}
          onClick={() => {
            mutation.mutate({ label, field, type });
          }}
        >
          <LoadingText
            spinner
            loading={mutation.isPending}
            loadingText="Saving"
          >
            {translate(mutation.isSuccess ? "Saved!" : "Favorite")}
          </LoadingText>
        </button>
      </ButtonContainer>

      {mutation.isError && (
        <ApiErrorsBlock
          category="favorites"
          handle="name"
          error={mutation.error}
        />
      )}
    </FavoriteFormWrapper>
  );
};
