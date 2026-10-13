import { FormComponent } from "@components/form-controls";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import type { ModalContainerProps } from "@components/modals/modal.types";
import {
  SlideoutContainer,
  SlideoutFooter,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import { useFetchFormGroups } from "@ff-client/queries/form-groups";
import type { ErrorList } from "@ff-client/types/api";
import type {
  FormGroupsListRefs,
  FormWithGroup,
} from "@ff-client/types/form-groups";
import { PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import CrossIcon from "@ff-icons/actions/delete";
import MoveIcon from "@ff-icons/actions/move";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import {
  CloseAndMoveWrapper,
  ErrorBlock,
  GroupColumn,
  GroupHeader,
  GroupItemWrapper,
  GroupLayout,
  GroupListWrapper,
  Groups,
  GroupToolbar,
  GroupWrapper,
  ManagerWrapper,
  UnassignedGroup,
  UnassignedGroupWrapper,
} from "./modal.group.styles";
import { FormItem } from "./modal.list-item";
import { useFormGroupsOperations } from "./modal.list-item.operations";
import { useFormGroupsMutation } from "./modal.list-item.queries";
import {
  initializeGroupedSortable,
  initializeSortable,
} from "./sortable.initializer";

export const EditGroupModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const [state, setState] = useState<FormWithGroup>({});
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<ErrorList>();

  const { data, isError } = useFetchFormGroups();

  const formGroupsListRefs = useRef<FormGroupsListRefs>({});
  const { addGroup, updateGroupInfo, syncFormGroupsRefs } =
    useFormGroupsOperations(state, setState, formGroupsListRefs);

  useEffect(() => {
    if (data && !loaded) {
      setState(data);

      setLoaded(true);
    }
  }, [data, loaded]);

  useEffect(() => {
    return initializeSortable(formGroupsListRefs);
  }, []);

  const updateMutation = useFormGroupsMutation({
    onSuccess: () => {
      closeModal();
    },
    onError: (error) => {
      setErrors({ message: error.message, ...error.errors });
    },
  });

  const isLoading = updateMutation.isPending;

  return (
    <SlideoutContainer>
      <SlideoutHeader>
        <h1>{translate("Form Group Manager")}</h1>
        <button
          type="button"
          className="btn header-btn"
          aria-label={translate("Close")}
          onClick={closeModal}
        >
          <CrossIcon />
        </button>
      </SlideoutHeader>

      <ManagerWrapper>
        <GroupColumn>
          <GroupToolbar>
            <button
              onClick={addGroup}
              type="button"
              className="btn add icon dashed"
              disabled={!loaded || isLoading}
            >
              {translate("Add Group")}
            </button>
          </GroupToolbar>
          <GroupWrapper
            ref={(el) => {
              formGroupsListRefs.current.groupWrapper = el;
            }}
            $empty={translate("Click 'Add Group' to begin.")}
          >
            {(isError || (errors && Object.keys(errors).length > 0)) && (
              <ErrorBlock role="alert">
                {translate("Something went wrong!")}
              </ErrorBlock>
            )}
            {state.formGroups?.groups?.map((group) => (
              <GroupLayout key={group.uid} data-id={group.uid}>
                <GroupHeader>
                  <FormComponent
                    value={group.label}
                    property={{
                      type: PropertyType.Label,
                      handle: group.uid,
                    }}
                    updateValue={(value: string) =>
                      updateGroupInfo("label", value, group.uid)
                    }
                  />
                </GroupHeader>
                <GroupItemWrapper
                  $empty={translate("Drag forms here.")}
                  ref={(el) => {
                    initializeGroupedSortable(
                      el,
                      group.uid,
                      formGroupsListRefs,
                    );
                  }}
                >
                  {group.forms?.map((form) => (
                    <FormItem key={form.id} form={form} />
                  ))}
                </GroupItemWrapper>
                <CloseAndMoveWrapper>
                  <button type="button" className="group-remove">
                    <CrossIcon />
                  </button>
                  <button type="button" className="handle">
                    <MoveIcon />
                  </button>
                </CloseAndMoveWrapper>
              </GroupLayout>
            ))}
          </GroupWrapper>
        </GroupColumn>
        <GroupListWrapper>
          <UnassignedGroupWrapper>
            <UnassignedGroup className="unassigned">
              <h3>{translate("Unassigned")}</h3>
              <Groups
                $empty={translate(
                  "Drag forms here to leave them unassigned. They appear after the groups.",
                )}
                ref={(el) => {
                  formGroupsListRefs.current.unassigned = el;
                }}
              >
                {state?.forms
                  ?.filter((form) => form.dateArchived === null)
                  .map((form) => (
                    <FormItem key={form.id} form={form} />
                  ))}
              </Groups>
            </UnassignedGroup>
          </UnassignedGroupWrapper>
        </GroupListWrapper>
      </ManagerWrapper>

      <SlideoutFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Close")}
        </button>
        <button
          type="button"
          className="btn submit"
          disabled={!loaded || isLoading}
          onClick={() => {
            setErrors(undefined);
            updateMutation.mutate(syncFormGroupsRefs());
          }}
        >
          <LoadingText
            loadingText={translate("Saving")}
            loading={isLoading}
            spinner
          >
            {translate("Save")}
          </LoadingText>
        </button>
      </SlideoutFooter>
    </SlideoutContainer>
  );
};
