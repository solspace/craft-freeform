import React, { useEffect, useRef, useState } from 'react';
import { FormComponent } from '@components/form-controls';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import { useFetchFormGroups } from '@ff-client/queries/form-groups';
import type { ErrorList } from '@ff-client/types/api';
import type {
  FormGroupsListRefs,
  FormWithGroup,
} from '@ff-client/types/form-groups';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import CrossIcon from '@ff-icons/actions/delete.svg';
import MoveIcon from '@ff-icons/actions/move.svg';

import {
  CloseAndMoveWrapper,
  ErrorBlock,
  GroupHeader,
  GroupItemWrapper,
  GroupLayout,
  GroupListWrapper,
  Groups,
  GroupWrapper,
  ManagerWrapper,
  UnassignedGroup,
  UnassignedGroupWrapper,
} from './group-modal.styles';
import { FormItem } from './modal.list-item';
import { useFormGroupsOperations } from './modal.list-item.operations';
import { useFormGroupsMutation } from './modal.list-item.queries';
import {
  initializeGroupedSortable,
  initializeSortable,
} from './sortable.initializer';

export const EditGroupModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const [state, setState] = useState<FormWithGroup>({});
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<ErrorList>();

  const { data } = useFetchFormGroups();

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
    initializeSortable(formGroupsListRefs);
  }, []);

  const updateMutation = useFormGroupsMutation({
    onSuccess: () => {
      closeModal();
    },
    onError: (error) => {
      setErrors(error.errors);
    },
  });

  const isLoading = updateMutation.isLoading;

  return (
    <ModalContainer style={{ maxWidth: '60%' }}>
      <ModalHeader>
        <h1>{translate('Group Manager')}</h1>
      </ModalHeader>

      <ManagerWrapper>
        <GroupWrapper
          ref={(el) => (formGroupsListRefs.current.groupWrapper = el)}
          $empty={translate(
            "Click the 'Add Group' button on the right to begin."
          )}
        >
          {errors?.length && (
            <ErrorBlock>{translate('Something went wrong!')}</ErrorBlock>
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
                    updateGroupInfo('label', value, group.uid)
                  }
                />
              </GroupHeader>
              <GroupItemWrapper
                $empty={translate('Drag and drop any field here')}
                ref={(el) => {
                  initializeGroupedSortable(el, group.uid, formGroupsListRefs);
                }}
              >
                {group.forms?.map((form) => (
                  <FormItem key={form.id} form={form} />
                ))}
              </GroupItemWrapper>
              <CloseAndMoveWrapper>
                <button className="group-remove">
                  <CrossIcon />
                </button>
                <button className="handle">
                  <MoveIcon />
                </button>
              </CloseAndMoveWrapper>
            </GroupLayout>
          ))}
        </GroupWrapper>
        <GroupListWrapper>
          <button
            onClick={addGroup}
            type="button"
            className="btn add icon dashed"
          >
            {translate('Add Group')}
          </button>
          <UnassignedGroupWrapper>
            <UnassignedGroup className="unassigned">
              <h3>{translate('Unassigned')}</h3>
              <Groups
                $empty={translate(
                  'Drag and drop any form here. Unassigned form will display at the bottom of the list of Groups.'
                )}
                ref={(el) => (formGroupsListRefs.current.unassigned = el)}
              >
                {state?.forms &&
                  state.forms
                    .filter((form) => form.dateArchived === null)
                    .map((form) => <FormItem key={form.id} form={form} />)}
              </Groups>
            </UnassignedGroup>
          </UnassignedGroupWrapper>
        </GroupListWrapper>
      </ManagerWrapper>

      <ModalFooter>
        <button className="btn cancel" onClick={closeModal}>
          {translate('Close')}
        </button>
        <button className="btn submit">
          <LoadingText
            loadingText={translate('Saving')}
            loading={isLoading}
            onClick={() => updateMutation.mutate(syncFormGroupsRefs())}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
