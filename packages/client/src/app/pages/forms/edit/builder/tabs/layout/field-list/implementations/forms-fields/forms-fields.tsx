import { ErrorBlock } from "@components/notification-blocks/error/error-block";
import type { RootState } from "@editor/store";
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import { Search } from "@editor/store/slices/search";
import { searchSelectors } from "@editor/store/slices/search/search.selectors";
import { useFetchForms } from "@ff-client/queries/field-forms";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useId, useState } from "react";
import { useSelector } from "react-redux";

import { useSelectSearchedForms } from "../../hooks/use-select-searched-fields";

import ChevronIcon from "./chevron";
import { FormBlock } from "./form-block";
import {
  FormFieldsChevron,
  FormFieldsContent,
  FormFieldsTitle,
  FormFieldsToggle,
  FormFieldsWrapper,
} from "./forms-fields.styles";

export const FormsFields: React.FC = () => {
  const uid = useSelector(
    (state: RootState) => formSelectors.current(state)?.uid,
  );
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));
  const [expanded, setExpanded] = useState(false);
  const [requested, setRequested] = useState(false);
  const contentId = useId();
  const isOpen = expanded || searchQuery.length > 0;

  const select = useSelectSearchedForms();
  const { data, isFetching, isError, error } = useFetchForms({
    select,
    enabled: requested || isOpen,
  });

  const forms = (data || [])
    .filter((form) => form.uid !== uid && form.fields.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <FormFieldsWrapper>
      <FormFieldsTitle>
        <FormFieldsToggle
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => {
            setRequested(true);
            setExpanded(!isOpen);
          }}
        >
          {translate("Fields from other Forms")}
          <FormFieldsChevron aria-hidden="true">
            <ChevronIcon />
          </FormFieldsChevron>
        </FormFieldsToggle>
      </FormFieldsTitle>
      <FormFieldsContent id={contentId} hidden={!isOpen}>
        {isOpen && (
          <>
            {!data && isFetching && (
              <p role="status">{translate("Loading...")}</p>
            )}
            {isError && <ErrorBlock>{error.message}</ErrorBlock>}
            {data && forms.length === 0 && (
              <p>{translate("No results found")}</p>
            )}
            {forms.map((form) => (
              <FormBlock key={form.uid} form={form} />
            ))}
          </>
        )}
      </FormFieldsContent>
    </FormFieldsWrapper>
  );
};
