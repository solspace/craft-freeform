import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { Search } from "@components/search/search";
import type { FieldMapping as FieldMappingType } from "@ff-client/types/integrations";
import type { FieldMappingProperty } from "@ff-client/types/properties";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";
import type React from "react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import RefreshIcon from "./icons/refresh";
import { FieldMappingController } from "./mapping.controller";
import { MappingSearchWrapper, RefreshButton } from "./mapping.styles";
import type { SourceField } from "./mapping.types";
import { extractParameter } from "./mapping.utilities";

const MAX_VISIBLE_SOURCES = 12;

const FieldMapping: React.FC<ControlType<FieldMappingProperty>> = ({
  value = {},
  property,
  errors,
  updateValue,
  context,
}) => {
  const { formId } = useParams();
  const [query, setQuery] = useState("");

  const params: Record<string, string> = { formId: formId as string };
  if (property.parameterFields) {
    Object.entries(property.parameterFields).forEach(([key, value]) => {
      params[value] = extractParameter(context, key);
    });
  }

  const { data, isFetching, refetch } = useQuery<SourceField[]>({
    queryKey: ["field-mapping", property.source, params],
    queryFn: async () => {
      const response = await axios
        .get<SourceField[]>(property.source!, { params })
        .then((res) => res.data);

      return response;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (isFetching || data === undefined) {
      return;
    }

    const availableProperties = data.map((item) => String(item.id));

    const valueClone = cloneDeep(value);
    let modified = false;
    Object.keys(value!).forEach((key) => {
      if (!availableProperties.includes(key)) {
        delete valueClone![key];
        modified = true;
      }
    });

    if (modified) {
      updateValue(valueClone);
    }
  }, [isFetching, data, value, updateValue]);

  return (
    <Control property={property} errors={errors}>
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

      {data && (
        <>
          {data.length > MAX_VISIBLE_SOURCES && (
            <MappingSearchWrapper>
              <Search query={query} setQuery={setQuery} showShortcut={false} />
            </MappingSearchWrapper>
          )}

          <FieldMappingController
            sources={data}
            mapping={value as FieldMappingType}
            query={query}
            updateValue={updateValue}
          />
        </>
      )}
      {!data && isFetching && (
        <div>
          <Skeleton width="40%" />
          <Skeleton width="35%" />
          <Skeleton width="42%" />
        </div>
      )}
    </Control>
  );
};

export default FieldMapping;
