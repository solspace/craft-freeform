import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import config, { Edition } from "@config/freeform/freeform.config";
import { useLocalStorage } from "@ff-client/hooks/ts-hooks/use-local-storage";
import {
  fetchFieldPropertySections,
  fetchFieldTypes,
  QKFieldTypes,
} from "@ff-client/queries/field-types";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import EditIcon from "@ff-icons/actions/edit";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Header,
  Title,
  ViewButtons,
  ViewControls,
} from "./list-view.styles";
import { useAddFormModal } from "./modals/hooks/use-add-form-modal";
import { useEditGroupModal } from "./modals/hooks/use-edit-group-modal";
import { FormGrid } from "./views/grid/grid";
import { GroupsButton } from "./views/grid/grid.styles";
import { FormList } from "./views/list/list";

enum View {
  List,
  Grid,
}

export const ListProvider: React.FC = () => {
  const queryClient = useQueryClient();
  const openEditGroupModal = useEditGroupModal();
  const openAddForm = useAddFormModal();

  const [view, setView] = useLocalStorage("forms-list-view", View.Grid);
  const isCraft5 = config.metadata.craft.is5;
  const { canCreate } = config.metadata.freeform;

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: QKFieldTypes.all,
      queryFn: fetchFieldTypes,
      staleTime: Infinity,
    });
    void queryClient.prefetchQuery({
      queryKey: QKFieldTypes.propertySections(),
      queryFn: fetchFieldPropertySections,
      staleTime: Infinity,
    });
  }, [queryClient]);

  return (
    <>
      <Breadcrumb id="form-list" label="Forms" url="/forms" />

      <Header>
        <Title>{translate("Forms")}</Title>

        <ViewControls>
          {config.editions.isAtLeast(Edition.Pro) &&
            config.metadata.freeform.canOrganizeForms && (
              <GroupsButton
                type="button"
                className="btn"
                onClick={openEditGroupModal}
              >
                <EditIcon />
                {translate("Form groups")}
              </GroupsButton>
            )}
          <ViewButtons className="btngroup btngroup--exclusive">
            <button
              type="button"
              className={classes("btn", View.Grid === view && "active")}
              data-icon={classes(isCraft5 ? "element-cards" : "grid")}
              aria-label={translate("Display as cards")}
              title={translate("Display as cards")}
              onClick={() => setView(View.Grid)}
            />
            <button
              type="button"
              className={classes("btn", View.List === view && "active")}
              data-icon="list"
              aria-label="Display in a table"
              title={translate("Display as list")}
              onClick={() => setView(View.List)}
            />
          </ViewButtons>
        </ViewControls>

        {canCreate && (
          <ButtonGroup>
            <Button
              type="button"
              className="btn submit add icon"
              onClick={openAddForm}
            >
              {translate("Add new form")}
            </Button>
          </ButtonGroup>
        )}
      </Header>

      {view === View.List && <FormList />}
      {view === View.Grid && <FormGrid />}
    </>
  );
};
