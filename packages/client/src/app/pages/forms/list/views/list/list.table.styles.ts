import { TruncateBox } from "@components/layout/blocks/truncate";
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

  .form-icon-column { width: 24px; padding-inline-end: 8px; text-align: center; vertical-align: middle; }

  tbody td ${TruncateBox} { vertical-align: middle; }
  .form-icon-column > span { display: grid; margin-inline: auto; }

  /* Make the Description column shorter on medium & small screens */
  tbody td.form-description span {
    max-width: 400px !important;
  }

  @media (max-width: 1280px) {
    tbody td.form-description span {
      max-width: 320px !important;
    }
  }

  @media (max-width: 1023px) {
    tbody td.form-description span {
      max-width: 220px !important;
    }
  }

  @media (max-width: 699px) {
    tbody td.form-description span {
      max-width: 120px !important;
    }
  }
`;
