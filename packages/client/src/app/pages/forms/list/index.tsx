import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import config from "@config/freeform/freeform.config";
import { useLocalStorage } from "@ff-client/hooks/ts-hooks/use-local-storage";
import {
  fetchFieldPropertySections,
  fetchFieldTypes,
  QKFieldTypes,
} from "@ff-client/queries/field-types";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import {
  AiButton,
  Button,
  ButtonGroup,
  EnableAiLink,
  Header,
  Title,
  ViewButtons,
} from "./list-view.styles";
import { useCreateFormModal } from "./modals/hooks/use-create-form-modal";
import { useCreateWithAiFormModal } from "./modals/hooks/use-create-with-ai-form-modal";
import { useAiIntegrations } from "./modals/modal.form.create-with-ai.queries";
import { FormGrid } from "./views/grid/grid";
import { FormList } from "./views/list/list";

enum View {
  List,
  Grid,
}

export const ListProvider: React.FC = () => {
  const queryClient = useQueryClient();
  const openCreateFormModal = useCreateFormModal();
  const openCreateWithAiFormModal = useCreateWithAiFormModal();
  const { data: aiIntegrations } = useAiIntegrations();

  const [view, setView] = useLocalStorage("forms-list-view", View.Grid);
  const isCraft5 = config.metadata.craft.is5;
  const { canCreate } = config.metadata.freeform;
  const canViewIntegrations = config.permissions.integrations !== "none";
  const showAiButtons = canViewIntegrations;
  const showEnableAi =
    showAiButtons && aiIntegrations && aiIntegrations.length === 0;

  queryClient.prefetchQuery({
    queryKey: QKFieldTypes.all,
    queryFn: fetchFieldTypes,
  });
  queryClient.prefetchQuery({
    queryKey: QKFieldTypes.propertySections(),
    queryFn: fetchFieldPropertySections,
  });

  return (
    <>
      <Breadcrumb id="form-list" label="Forms" url="/forms" />

      <Header>
        <Title>{translate("Forms")}</Title>

        <ViewButtons className="btngroup btngroup--exclusive">
          <button
            type="button"
            className={classes("btn", View.List === view && "active")}
            data-icon="list"
            aria-label="Display in a table"
            title={translate("Display as list")}
            onClick={() => setView(View.List)}
          />
          <button
            type="button"
            className={classes("btn", View.Grid === view && "active")}
            data-icon={classes(isCraft5 ? "element-cards" : "grid")}
            title={translate("Display as cards")}
            onClick={() => setView(View.Grid)}
          />
        </ViewButtons>

        {canCreate && (
          <ButtonGroup>
            {showAiButtons &&
              (showEnableAi ? (
                <EnableAiLink
                  to="/integrations/ai/SolspaceAIV1"
                  className="btn add icon"
                  data-icon="sparkles"
                >
                  {translate("Enable AI")}
                </EnableAiLink>
              ) : (
                <AiButton
                  type="button"
                  className="btn add icon"
                  data-icon="sparkles"
                  onClick={openCreateWithAiFormModal}
                >
                  {translate("Create with AI")}
                </AiButton>
              ))}
            <Button
              className="btn submit add icon"
              onClick={openCreateFormModal}
            >
              {translate("Add new Form")}
            </Button>
          </ButtonGroup>
        )}
      </Header>

      {view === View.List && <FormList />}
      {view === View.Grid && <FormGrid />}
    </>
  );
};
