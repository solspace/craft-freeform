import { Checkboxes } from "@components/elements/checkboxes/checkboxes";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type {
  DynamicCheckboxesProperty,
  OptionCollection,
} from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import RefreshIcon from "@ff-icons/actions/refresh";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { extractParameter } from "../namespaced/field-mapping/mapping.utilities";

import {
  CheckboxesContainer,
  RefreshButton,
} from "./dynamic-checlboxes.styles";

const DynamicCheckboxes: React.FC<ControlType<DynamicCheckboxesProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const { formId } = useParams();
  const { handle, source, parameterFields } = property;

  const params: Record<string, string> = { formId };
  if (parameterFields) {
    Object.entries(parameterFields).forEach(([key, value]) => {
      params[value] = extractParameter(context, key);
    });
  }

  const { data, isFetching, isFetched, refetch } = useQuery({
    queryKey: ["dynamic-select", source, params],
    queryFn: () =>
      axios.get<OptionCollection>(source, { params }).then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (isFetching || !isFetched) {
      return;
    }

    if (data === undefined) {
      return;
    }

    if (value.length > 0) {
      return;
    }

    updateValue([]);
  }, [data, isFetched, isFetching, updateValue, value.length]);

  return (
    <Control property={property} errors={errors}>
      <CheckboxesContainer>
        <RefreshButton
          className="btn"
          disabled={isFetching}
          onClick={() => {
            params.refresh = "true";
            refetch();
            delete params.refresh;
          }}
        >
          <RefreshIcon />
        </RefreshButton>

        <Checkboxes
          value={value}
          options={data}
          loading={isFetching}
          emptyMessage={translate("No options available")}
          uniqueId={handle}
          onUpdate={updateValue}
        />
      </CheckboxesContainer>
    </Control>
  );
};

export default DynamicCheckboxes;
