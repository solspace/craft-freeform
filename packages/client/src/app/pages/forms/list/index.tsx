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
import { useEffect, useState } from "react";
import { FormSearch } from "./form-search";
import {
  Button,
  ButtonGroup,
  Header,
  HeaderContainer,
  PeriodControlHost,
  Title,
  ViewButtons,
  ViewControls,
} from "./list-view.styles";
import { useAddFormModal } from "./modals/hooks/use-add-form-modal";
import { useEditGroupModal } from "./modals/hooks/use-edit-group-modal";
import { InsertWidgetMenu } from "./views/grid/card/card.widget";
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

  const [search, setSearch] = useState("");
  const [periodHost, setPeriodHost] = useState<HTMLDivElement | null>(null);
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

      <HeaderContainer>
        <Header>
          <Title>{translate("Forms")}</Title>

          <ViewControls>
            <FormSearch value={search} onChange={setSearch} />
            <ViewButtons
              className="btngroup btngroup--exclusive"
              aria-label={translate("View")}
            >
              <button
                type="button"
                className={classes("btn", View.Grid === view && "active")}
                data-icon={classes(isCraft5 ? "element-cards" : "grid")}
                aria-label={translate("Display as cards")}
                aria-pressed={View.Grid === view}
                title={translate("Display as cards")}
                onClick={() => setView(View.Grid)}
              />
              <button
                type="button"
                className={classes("btn", View.List === view && "active")}
                data-icon="list"
                aria-label={translate("Display in a table")}
                aria-pressed={View.List === view}
                title={translate("Display as list")}
                onClick={() => setView(View.List)}
              />
            </ViewButtons>
            {view === View.Grid && config.editions.isAtLeast(Edition.Pro) && (
              <PeriodControlHost ref={setPeriodHost} />
            )}
            {view === View.Grid && config.editions.isAtLeast(Edition.Pro) && (
              <InsertWidgetMenu />
            )}
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
      </HeaderContainer>

      {view === View.List && <FormList search={search} />}
      {view === View.Grid && (
        <FormGrid search={search} periodHost={periodHost} />
      )}
    </>
  );
};
