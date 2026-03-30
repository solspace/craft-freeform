import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const TableScrollWrapper = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;

  @media (max-width: 1023px) {
    ${scrollBar};
  }
`;

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;

  /* Make the Description column shorter on medium & small screens */
  tbody td:nth-child(3) span {
    max-width: 400px !important;
  }

  @media (max-width: 1280px) {
    tbody td:nth-child(3) span {
      max-width: 320px !important;
    }
  }

  @media (max-width: 1023px) {
    tbody td:nth-child(3) span {
      max-width: 220px !important;
    }
  }

  @media (max-width: 699px) {
    tbody td:nth-child(3) span {
      max-width: 120px !important;
    }
  }
`;
