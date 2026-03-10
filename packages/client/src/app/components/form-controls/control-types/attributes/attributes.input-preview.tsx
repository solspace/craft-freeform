import type { AttributeTab } from "@ff-client/types/properties";
import type React from "react";

import {
  CodeBlock,
  Name,
  Operator,
  Quote,
  Value,
} from "./attributes.input-preview.styles";
import { attributesToArray } from "./attributes.operations";
import type { AttributeEntry } from "./attributes.types";

type Props = {
  tab: AttributeTab;
  attributes: AttributeEntry[];
};

export const InputPreview: React.FC<Props> = ({ tab, attributes }) => {
  const tag: string =
    attributes.find(([key]) => key.toLowerCase() === "tag")?.[1] ||
    tab.previewTag;

  return (
    <CodeBlock>
      {"<"}
      {tag}
      {attributesToArray(attributes)
        .filter(([name]) => name !== "tag")
        .map(([name, value], idx) => (
          <span key={idx}>
            <Name> {name}</Name>
            {!!value && (
              <>
                <Operator>=</Operator>
                <Quote />
                <Value>{value}</Value>
                <Quote />
              </>
            )}
          </span>
        ))}
      {" />"}
    </CodeBlock>
  );
};
