import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import {
  findFirstValue,
  isInOptions,
} from "@components/elements/custom-dropdown/dropdown.operations";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type {
  DynamicSelectProperty,
  OptionCollection,
} from "@ff-client/types/properties";
import RefreshIcon from "@ff-icons/actions/refresh";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { extractParameter } from "../namespaced/field-mapping/mapping.utilities";

import { DropdownContainer, RefreshButton } from "./dynamic-select.styles";

const DynamicSelect: React.FC<ControlType<DynamicSelectProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const { formId } = useParams();
  const { source, parameterFields, emptyOption } = property;

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

    if (isInOptions(data, value)) {
      return;
    }

    if (emptyOption) {
      updateValue("");
    } else {
      const firstValue = findFirstValue(data);
      updateValue(firstValue);
    }
  }, [data, isFetched, isFetching, updateValue, value, emptyOption]);

  return (
    <Control property={property} errors={errors} context={context}>
      <DropdownContainer>
        <Dropdown
          loading={isFetching}
          value={value}
          onChange={updateValue}
          emptyOption={emptyOption}
          options={data}
        />

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
      </DropdownContainer>
    </Control>
  );
};

export default DynamicSelect;
