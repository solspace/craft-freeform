import { useAppDispatch } from "@editor/store";
import { addNewPage } from "@editor/store/thunks/pages";
import type React from "react";

import AddIcon from "./add-icon.svg";
import { NewTabWrapper } from "./new-tab.styles";

export const NewTab: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <NewTabWrapper
      className="new-page-tab"
      onClick={(): void => {
        dispatch(addNewPage());
      }}
    >
      <AddIcon />
    </NewTabWrapper>
  );
};
