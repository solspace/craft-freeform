import config, { Edition } from "@config/freeform/freeform.config";
import { useAppSelector } from "@editor/store";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { isPageForm } from "@editor/store/thunks/fields/containers";
import { useFetchFieldPropertySections } from "@ff-client/queries/field-types";
import classes from "@ff-client/utils/classes";
import type React from "react";
import { useSelector } from "react-redux";
import { ContentCatalogs } from "./catalog/catalog";
import { FieldListWrapper } from "./field-list.styles";
import { BaseFields } from "./implementations/base-fields/base-fields";
import { FavoriteFields } from "./implementations/favorite-fields/favorite-fields";
import { FormsFields } from "./implementations/forms-fields/forms-fields";
import { Search } from "./search/search";

export const FieldList: React.FC = () => {
  useFetchFieldPropertySections();
  const pageForm = useAppSelector(isPageForm);

  const fieldCount = useSelector(fieldSelectors.count);
  const disabled =
    config.editions.is(Edition.Express) && fieldCount >= config.limits.fields;

  return (
    <FieldListWrapper
      data-wizard-tour="fields"
      className={classes(disabled && "fields-disabled")}
    >
      <Search />
      {pageForm && <ContentCatalogs />}
      <FavoriteFields />
      <BaseFields />
      {!pageForm && <ContentCatalogs />}
      {config.limitations.can("layout.formsFields") && <FormsFields />}
    </FieldListWrapper>
  );
};
