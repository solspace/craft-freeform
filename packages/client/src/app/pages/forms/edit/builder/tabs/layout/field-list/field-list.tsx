import config, { Edition } from "@config/freeform/freeform.config";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { useFetchFieldPropertySections } from "@ff-client/queries/field-types";
import classes from "@ff-client/utils/classes";
import type React from "react";
import { useSelector } from "react-redux";
import { FieldListWrapper } from "./field-list.styles";
import { BaseFields } from "./implementations/base-fields/base-fields";
import { FavoriteFields } from "./implementations/favorite-fields/favorite-fields";
import { FormsFields } from "./implementations/forms-fields/forms-fields";
import { Search } from "./search/search";

export const FieldList: React.FC = () => {
  useFetchFieldPropertySections();

  const fieldCount = useSelector(fieldSelectors.count);
  const disabled =
    config.editions.is(Edition.Express) && fieldCount >= config.limits.fields;

  return (
    <FieldListWrapper className={classes(disabled && "fields-disabled")}>
      <Search />
      <FavoriteFields />
      <BaseFields />
      {config.limitations.can("layout.formsFields") && <FormsFields />}
    </FieldListWrapper>
  );
};
