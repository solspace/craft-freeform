import { HexColorInput } from "@components/elements/hex-color-input/hex-color-input";
import { FormComponent } from "@components/form-controls";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalType } from "@components/modals/modal.types";
import { useGroupMutation } from "@editor/builder/tabs/layout/property-editor/editors/fields/groups/groups.queries";
import { useClickOutside } from "@ff-client/hooks/use-click-outside";
import { useFetchGroups } from "@ff-client/queries/groups";
import type { ErrorList } from "@ff-client/types/api";
import type { FieldListRefs, Group } from "@ff-client/types/groups";
import { PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import CrossIcon from "@ff-icons/actions/delete";
import MoveIcon from "@ff-icons/actions/move";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { FieldItem } from "./modal.list-item";
import { useGroupOperations } from "./modal.operations";
import {
  CloseAndMoveWrapper,
  ColorCircle,
  ColorPickerWrapper,
  ColorPopover,
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
} from "./modal.styles";
import {
  initializeGroupedSortable,
  initializeSortable,
} from "./sortable.initializer";

type GroupColorPickerProps = {
  color?: string;
  onChange: (color: string) => void;
};

const GroupColorPicker: React.FC<GroupColorPickerProps> = ({
  color,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useClickOutside<HTMLDivElement>({
    callback: () => setIsOpen(false),
    isEnabled: isOpen,
  });

  return (
    <ColorPickerWrapper ref={wrapperRef}>
      <ColorCircle
        type="button"
        color={color}
        aria-expanded={isOpen}
        aria-label={translate("Select Color")}
        onClick={() => setIsOpen((current) => !current)}
      />

      {isOpen && (
        <ColorPopover>
          <HexColorInput value={color} onChange={onChange} />
        </ColorPopover>
      )}
    </ColorPickerWrapper>
  );
};

export const CreateModal: ModalType = ({ closeModal }) => {
  const [state, setState] = useState<Group>({});
  const [errors, setErrors] = useState<ErrorList>();
  const [loaded, setLoaded] = useState(false);

  const fieldListRefs = useRef<FieldListRefs>({});
  const { addGroup, updateGroupInfo, syncFromRefs } = useGroupOperations(
    state,
    setState,
    fieldListRefs,
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

  const isLoading = updateMutation.isPending;

  return (
    <ModalContainer style={{ maxWidth: "70%" }}>
      <ModalHeader>
        <h1>{translate("Field Type Manager")}</h1>
      </ModalHeader>
      <ManagerWrapper>
        <GroupWrapper
          ref={(el) => {
            fieldListRefs.current.groupWrapper = el;
          }}
          $empty={translate(
            "Click the 'Add Group' button on the right to begin.",
          )}
        >
          {errors?.length && (
            <ErrorBlock>{translate("Something went wrong!")}</ErrorBlock>
          )}
          {state.groups?.grouped?.map((group) => (
            <GroupLayout key={group.uid} data-id={group.uid}>
              <GroupType>
                <GroupHeader>
                  <GroupColorPicker
                    color={group.color}
                    onChange={(color) =>
                      updateGroupInfo("color", color, group.uid)
                    }
                  />

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
                  $empty={translate("Drag and drop any field here")}
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
        <FieldListWrapper>
          <button
            onClick={addGroup}
            type="button"
            className="btn add icon dashed"
          >
            {translate("Add Group")}
          </button>
          <UHFieldWrapper>
            <UHField className="unassigned">
              <h3>{translate("Unassigned")}</h3>

              <FieldTypes
                $empty={translate(
                  "Drag and drop any fields here. Unassigned fields will display at the bottom of the list of field types.",
                )}
                ref={(el) => {
                  fieldListRefs.current.unassigned = el;
                }}
              >
                {state.types?.map((item) => (
                  <FieldItem key={item} typeClass={item} />
                ))}
              </FieldTypes>
            </UHField>
            <UHField>
              <h3>{translate("Hidden")}</h3>

              <FieldTypes
                $empty={translate(
                  "Drag and drop any fields here to hide them.",
                )}
                ref={(el) => {
                  fieldListRefs.current.hidden = el;
                }}
              >
                {state.groups?.hidden?.map((item) => (
                  <FieldItem key={item} typeClass={item} />
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
          {translate("Cancel")}
        </button>
        <button type="button" className="btn submit">
          <LoadingText
            loadingText={translate("Saving")}
            loading={isLoading}
            onClick={() => updateMutation.mutate(syncFromRefs())}
            spinner
          >
            {translate("Save")}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
