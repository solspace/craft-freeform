import { useAppDispatch } from "@editor/store";
import { addNewPage } from "@editor/store/thunks/pages";
import translate from "@ff-client/utils/translations";
import type React from "react";

import AddIcon from "./add-icon";
import { NewTabWrapper } from "./new-tab.styles";

export const NewTab: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <NewTabWrapper
      type="button"
      aria-label={translate("Add page")}
      title={translate("Add page")}
      className="new-page-tab"
      onClick={(): void => {
        dispatch(addNewPage());
      }}
    >
      <AddIcon />
    </NewTabWrapper>
  );
};
