import React, { useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { Tooltip } from 'react-tippy';
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
  ErrorBlock,
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
import {
  initializeGroupedSortable,
  initializeSortable,
} from './sortable.initializer';

type ColorPickerProps = {
  groupUid: string | null;
  color: string;
};

export const CreateModal: ModalType = ({ closeModal }) => {
  const [state, setState] = useState<Group>({});
  const [colorPicker, setColorPicker] = useState<ColorPickerProps>();
  const [errors, setErrors] = useState<ErrorList>();
  const [loaded, setLoaded] = useState(false);

  const fieldListRefs = useRef<FieldListRefs>({});
  const { addGroup, updateGroupInfo, syncFromRefs } = useGroupOperations(
    state,
    setState,
    fieldListRefs
  );

  const { data } = useFetchGroups();

  useEffect(() => {
    if (data && !loaded) {
      setState(data);

      setLoaded(true);
    }
  }, [data, loaded]);

  useEffect(() => {
    initializeSortable(fieldListRefs);
  }, []);

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
        <GroupWrapper
          ref={(el) => (fieldListRefs.current.groupWrapper = el)}
          $empty={translate(
            "Click the 'Add Group' button on the right to begin."
          )}
        >
          {errors?.length && (
            <ErrorBlock>{translate('Something went wrong!')}</ErrorBlock>
          )}
          {state.groups?.grouped?.map(
            (group) =>
              group.uid !== 'hidden' && (
                <GroupLayout key={group.uid} data-id={group.uid}>
                  <GroupType>
                    <GroupHeader>
                      <Tooltip
                        trigger="click"
                        position="right"
                        interactive
                        interactiveBorder={0}
                        size="small"
                        theme="light"
                        arrow
                        html={
                          <ColorPicker>
                            <SketchPicker
                              color={colorPicker?.color || group.color}
                              onChange={(color) =>
                                setColorPicker({
                                  groupUid: group.uid,
                                  color: color.hex,
                                })
                              }
                              onChangeComplete={(color) => {
                                updateGroupInfo('color', color.hex, group.uid);
                              }}
                            />
                          </ColorPicker>
                        }
                      >
                        <ColorCircle
                          color={group.color}
                          onClick={() =>
                            setColorPicker({
                              groupUid: group.uid,
                              color: group.color,
                            })
                          }
                        />
                      </Tooltip>
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
                        initializeGroupedSortable(el, group.uid, fieldListRefs);
                      }}
                      color={group.color}
                    >
                      {group.types?.map((item) => (
                        <FieldItem key={item} typeClass={item} />
                      ))}
                    </GroupItemWrapper>
                  </GroupType>
                  <CloseAndMoveWrapper>
                    <button className="group-remove">
                      <CrossIcon />
                    </button>
                    <button className="handle">
                      <MoveIcon />
                    </button>
                  </CloseAndMoveWrapper>
                </GroupLayout>
              )
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
              <h3>{translate('Unassigned')}</h3>

              <FieldTypes
                $empty={translate(
                  'Drag and drop any fields here. Unassigned fields will display at the bottom of the list of field types.'
                )}
                ref={(el) => (fieldListRefs.current.unassigned = el)}
              >
                {state.types?.map((item) => (
                  <FieldItem key={item} typeClass={item} />
                ))}
              </FieldTypes>
            </UHField>
            <UHField>
              <h3>{translate('Hidden')}</h3>

              <FieldTypes
                $empty={translate(
                  'Drag and drop any fields here to hide them.'
                )}
                ref={(el) => (fieldListRefs.current.hidden = el)}
              >
                {state.groups?.grouped?.map(
                  (group) =>
                    group.uid === 'hidden' && (
                      <>
                        {group.types.map((item) => (
                          <FieldItem key={item} typeClass={item} />
                        ))}
                      </>
                    )
                )}
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
        <button type="button" className="btn submit">
          <LoadingText
            loadingText={translate('Saving')}
            loading={isLoading}
            onClick={() => updateMutation.mutate(syncFromRefs())}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
