import React, { useEffect, useRef, useState } from 'react';
import { FormComponent } from '@components/form-controls';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalType } from '@components/modals/modal.types';
import { useGroupMutation } from '@editor/builder/tabs/layout/property-editor/editors/fields/groups/groups.queries';
import { useFetchGroups } from '@ff-client/queries/groups';
import type { ErrorList } from '@ff-client/types/api';
import type { FieldListRefs, Group } from '@ff-client/types/groups';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import CrossIcon from '@ff-icons/actions/cross.svg';
import MoveIcon from '@ff-icons/actions/move.svg';

import {
  CloseAndMoveWrapper,
  ColorCircle,
  ColorPicker,
  ColorPickerContainer,
  FieldListWrapper,
  FieldTypes,
  GroupHeader,
  GroupItemWrapper,
  GroupLayout,
  GroupType,
  GroupWrapper,
  ManagerWrapper,
  UHField,
  UHFieldWrapper,
} from './modal.styles';
import { FieldItem } from './model.list-item';
import { useGroupOperations } from './model.operations';
import initializeSortable from './sortable.initializer';

export const CreateModal: ModalType = ({ closeModal }) => {
  const [state, setState] = useState<Group>({});
  const [colorPickerVisible, setColorPickerVisible] = useState<string | null>(
    null
  );
  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  const [errors, setErrors] = useState<ErrorList>();
  const [loaded, setLoaded] = useState(false);

  const fieldListRefs = useRef<FieldListRefs>({});
  const {
    addGroup,
    removeGroup,
    updateGroupInfo,
    addItemToUnassigned,
    syncFormRefs,
  } = useGroupOperations(state, setState, fieldListRefs);

  const { data } = useFetchGroups();

  useEffect(() => {
    if (!data || loaded) {
      return;
    }

    const { types, groups } = data;
    const unassignedTypes = types
      .map((_, index) => index)
      .filter(
        (index) =>
          !groups.hidden.includes(index) &&
          !groups.grouped.some((group) => group.types.includes(index))
      );

    setState({
      types,
      groups: {
        ...groups,
        unassigned: unassignedTypes,
      },
    });

    setLoaded(true);
  }, [data, loaded]);

  useEffect(() => {
    initializeSortable(fieldListRefs, state);
  }, [state]);

  const updateMutation = useGroupMutation({
    onSuccess: () => {
      closeModal();
    },
    onError: (error) => {
      setErrors(error.errors);
    },
  });

  const isLoading = updateMutation.isLoading;

  return (
    <ModalContainer style={{ maxWidth: '70%' }}>
      <ModalHeader>
        <h1>{translate('Field Manager')}</h1>
      </ModalHeader>
      <ManagerWrapper>
        <GroupWrapper ref={(el) => (fieldListRefs.current.groupWrapper = el)}>
          {state.groups?.grouped?.map((group) => (
            <GroupLayout key={group.uid} data-id={group.uid}>
              <GroupType>
                <GroupHeader>
                  <ColorCircle
                    color={group.color}
                    onClick={() => setColorPickerVisible(group.uid)}
                  />
                  {colorPickerVisible === group.uid && (
                    <ColorPickerContainer>
                      <ColorPicker
                        color={group.color}
                        onChangeComplete={(color) => {
                          updateGroupInfo('color', color.hex, group.uid);
                          setColorPickerVisible(null);
                        }}
                      />
                    </ColorPickerContainer>
                  )}
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
                  ref={(el) => (fieldListRefs.current[group.uid] = el)}
                  color={group.color}
                >
                  {group.types?.map((item) => (
                    <FieldItem
                      key={item}
                      typeIndex={item}
                      typeClass={state.types[item]}
                      addItemToUnassigned={() => addItemToUnassigned(item)}
                    />
                  ))}
                </GroupItemWrapper>
              </GroupType>
              <CloseAndMoveWrapper>
                <button onClick={() => removeGroup(group.uid)}>
                  <CrossIcon />
                </button>
                <button className="handle">
                  <MoveIcon />
                </button>
              </CloseAndMoveWrapper>
            </GroupLayout>
          ))}
          {state.groups?.grouped.length === 0 && (
            <span>Click the 'Add Group' button on the right to begin.</span>
          )}
        </GroupWrapper>
        <FieldListWrapper>
          <button
            onClick={addGroup}
            type="button"
            className="btn add icon dashed"
          >
            Add Group
          </button>
          <UHFieldWrapper>
            <UHField className="unassigned">
              <span>{translate('Unassigned')}</span>

              <FieldTypes
                $empty={translate('Drag and drop any field here')}
                ref={(el) => (fieldListRefs.current.unassigned = el)}
              >
                {state.groups?.unassigned?.map((item) => (
                  <FieldItem
                    key={item}
                    typeIndex={item}
                    typeClass={state.types[item]}
                    addItemToUnassigned={() => addItemToUnassigned(item)}
                  />
                ))}
              </FieldTypes>
            </UHField>
            <UHField>
              <span>{translate('Hidden')}</span>

              <FieldTypes
                $empty={translate('Drag and drop any field here')}
                ref={(el) => (fieldListRefs.current.hidden = el)}
              >
                {state.groups?.hidden?.map((item) => (
                  <FieldItem
                    key={item}
                    typeIndex={item}
                    typeClass={state.types[item]}
                    addItemToUnassigned={() => addItemToUnassigned(item)}
                  />
                ))}
              </FieldTypes>
            </UHField>
          </UHFieldWrapper>
        </FieldListWrapper>
      </ManagerWrapper>
      <ModalFooter>
        <button
          type="button"
          className="btn"
          onClick={closeModal}
          disabled={isLoading}
        >
          {translate('Cancel')}
        </button>
        <button
          onClick={() => updateMutation.mutate(syncFormRefs())}
          type="button"
          className="btn submit"
        >
          <LoadingText
            loadingText={translate('Saving')}
            loading={isLoading}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
