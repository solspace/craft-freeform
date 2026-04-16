import { colors } from "@ff-client/styles/variables";
import type React from "react";
import type { ComponentPropsWithRef } from "react";
import styled from "styled-components";

type Props = ComponentPropsWithRef<"ul"> & {
  errors?: string[];
};

const ErrorListComponent = styled.ul`
  list-style: square;

  margin-top: 5px;
  padding-left: 20px;

  color: ${colors.error};
`;

export const FormErrorList: React.FC<Props> = ({ errors, ...props }) => {
  if (!errors?.length) {
    return null;
  }

  return (
    <ErrorListComponent {...props}>
      {errors.map((error, idx) => (
        <li key={idx}>{error}</li>
      ))}
    </ErrorListComponent>
  );
};
