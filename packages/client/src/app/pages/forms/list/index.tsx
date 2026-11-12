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
import { createElement, useEffect, useState } from "react";
import { FormSearch } from "./form-search";
import {
  Button,
  ButtonGroup,
  Header,
  HeaderContainer,
  PageLayout,
  PeriodControlHost,
  Title,
  ViewButtons,
  ViewControls,
} from "./list-view.styles";
import { useAddFormModal } from "./modals/hooks/use-add-form-modal";
import { useEditGroupModal } from "./modals/hooks/use-edit-group-modal";
import { useWelcomeFormStart } from "./use-welcome-form-start";
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
  const { canCreate } = config.metadata.freeform;
  useWelcomeFormStart(canCreate, openAddForm);

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
    <PageLayout>
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
                aria-label={translate("Display as cards")}
                aria-pressed={View.Grid === view}
                title={translate("Display as cards")}
                onClick={() => setView(View.Grid)}
              >
                {createElement("craft-icon", {
                  name: "grid-2",
                  "aria-hidden": true,
                })}
              </button>
              <button
                type="button"
                className={classes("btn", View.List === view && "active")}
                aria-label={translate("Display in a table")}
                aria-pressed={View.List === view}
                title={translate("Display as list")}
                onClick={() => setView(View.List)}
              >
                {createElement("craft-icon", {
                  name: "list",
                  "aria-hidden": true,
                })}
              </button>
            </ViewButtons>
            {view === View.Grid && config.editions.isAtLeast(Edition.Pro) && (
              <PeriodControlHost ref={setPeriodHost} />
            )}
            {config.editions.isAtLeast(Edition.Pro) &&
              config.metadata.freeform.canOrganizeForms && (
                <GroupsButton
                  type="button"
                  className="btn"
                  onClick={openEditGroupModal}
                >
                  <EditIcon />
                  {translate("Groups")}
                </GroupsButton>
              )}
            {view === View.Grid && config.editions.isAtLeast(Edition.Pro) && (
              <InsertWidgetMenu />
            )}
          </ViewControls>

          {canCreate && (
            <ButtonGroup>
              <Button
                type="button"
                className="btn submit"
                onClick={openAddForm}
              >
                {createElement("craft-icon", {
                  name: "plus",
                  "aria-hidden": true,
                })}
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
    </PageLayout>
  );
};
