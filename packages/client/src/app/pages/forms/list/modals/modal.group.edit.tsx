import { LoadingText } from "@components/loaders/loading-text/loading-text";
import type { ModalContainerProps } from "@components/modals/modal.types";
import {
  SlideoutContainer,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import { useFetchFormGroups } from "@ff-client/queries/form-groups";
import type { ErrorList } from "@ff-client/types/api";
import type {
  FormGroupsListRefs,
  FormWithGroup,
} from "@ff-client/types/form-groups";
import translate from "@ff-client/utils/translations";
import CrossIcon from "@ff-icons/actions/delete";
import MoveIcon from "@ff-icons/actions/move";
import PencilIcon from "@ff-icons/actions/pencil";
import TrashIcon from "@ff-icons/actions/trash-can";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Confirmation,
  Count,
  Empty,
  ErrorBlock,
  Feedback,
  GroupHeader,
  GroupItemWrapper,
  GroupLayout,
  GroupName,
  GroupNameInput,
  GroupToolbar,
  GroupWrapper,
  HeadingCopy,
  IconButton,
  ManagerFooter,
  ManagerWrapper,
  UnassignedGroup,
  UnassignedToggle,
} from "./modal.group.styles";
import { FormItem } from "./modal.list-item";
import { useFormGroupsOperations } from "./modal.list-item.operations";
import { useFormGroupsMutation } from "./modal.list-item.queries";
import {
  initializeGroupedSortable,
  initializeSortable,
} from "./sortable.initializer";

export const EditGroupModal = ({ closeModal }: ModalContainerProps) => {
  const [state, setState] = useState<FormWithGroup>({});
  const [loaded, setLoaded] = useState(false);
  const [baseline, setBaseline] = useState<string>();
  const [errors, setErrors] = useState<ErrorList>();
  const [editing, setEditing] = useState<{ uid: string; original: string }>();
  const [removing, setRemoving] = useState<string>();
  const [unassignedOpen, setUnassignedOpen] = useState(true);
  const [message, setMessage] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const renameButtons = useRef<Record<string, HTMLButtonElement>>({});
  const focusAfterRename = useRef<string>(undefined);
  const refs = useRef<FormGroupsListRefs>({});
  const unassignedId = useId();
  const { data, isError } = useFetchFormGroups();
  const { addGroup, renameGroup, removeGroup, moveForm, moveGroup, payload } =
    useFormGroupsOperations(state, setState);
  const serialized = JSON.stringify(payload);
  const dirty = baseline !== undefined && serialized !== baseline;

  useEffect(() => {
    if (data && !loaded) {
      setState({
        ...data,
        forms: data.forms?.filter((form) => form.dateArchived === null) || [],
      });
      setLoaded(true);
    }
  }, [data, loaded]);
  useEffect(() => {
    if (loaded && baseline === undefined) setBaseline(serialized);
  }, [loaded, baseline, serialized]);
  useEffect(() => {
    if (editing) {
      nameInput.current?.focus();
      nameInput.current?.select();
    } else if (focusAfterRename.current) {
      renameButtons.current[focusAfterRename.current]?.focus();
      focusAfterRename.current = undefined;
    }
  }, [editing]);

  const updateMutation = useFormGroupsMutation({
    onSuccess: closeModal,
    onError: (error) => setErrors({ message: error.message, ...error.errors }),
  });
  const isLoading = updateMutation.isPending;
  const disabled = !loaded || isLoading;
  const sortHandlers = useMemo(
    () => ({
      moveForm: (id: number, uid: string | null, index: number) => {
        moveForm(id, uid, index);
        if (uid === null) setUnassignedOpen(true);
        setMessage(translate("Form moved."));
      },
      moveGroup: (uid: string, index: number) => {
        moveGroup(uid, index);
        setMessage(translate("Group order updated."));
      },
    }),
    [moveForm, moveGroup],
  );
  useEffect(() => {
    if (loaded) return initializeSortable(refs, sortHandlers, isLoading);
  }, [loaded, sortHandlers, isLoading]);

  const groups = state.formGroups?.groups || [];
  const unassigned = state.forms || [];
  const destinations = groups.map(({ uid, label }) => ({
    uid,
    label: label || translate("Untitled group"),
  }));
  const moveTo = useCallback(
    (id: number, uid: string | null) => {
      moveForm(id, uid);
      if (uid === null) setUnassignedOpen(true);
      setMessage(translate("Form moved."));
    },
    [moveForm],
  );

  const finishRename = () => {
    if (!editing) return;
    const group = groups.find(({ uid }) => uid === editing.uid);
    renameGroup(editing.uid, group?.label?.trim() || editing.original);
    focusAfterRename.current = editing.uid;
    setEditing(undefined);
  };

  return (
    <SlideoutContainer>
      <SlideoutHeader>
        <HeadingCopy>
          <h1>{translate("Form groups")}</h1>
          <p>{translate("Drag forms between groups to organize them.")}</p>
        </HeadingCopy>
        <button
          type="button"
          className="btn header-btn"
          aria-label={translate("Close")}
          onClick={closeModal}
          disabled={isLoading}
        >
          <CrossIcon />
        </button>
      </SlideoutHeader>
      <ManagerWrapper data-group-manager aria-busy={!loaded || isLoading}>
        {(isError || errors) && (
          <ErrorBlock role="alert">
            {translate("Could not save or load form groups. Please try again.")}
          </ErrorBlock>
        )}
        {!loaded && !isError && (
          <p role="status">{translate("Loading form groups…")}</p>
        )}
        <GroupToolbar>
          <span>{translate("Your groups")}</span>
          <button
            type="button"
            className="btn add icon"
            disabled={disabled}
            onClick={() => {
              const uid = addGroup();
              setEditing({ uid, original: translate("New group") });
              setMessage("");
            }}
          >
            {translate("Add group")}
          </button>
        </GroupToolbar>
        <GroupWrapper
          ref={(element) => {
            refs.current.groupWrapper = element;
          }}
        >
          {loaded && !groups.length && (
            <Empty>{translate("Add a group to organize your forms.")}</Empty>
          )}
          {groups.map((group, index) => {
            const label = group.label || translate("Untitled group");
            return (
              <GroupLayout
                key={group.uid}
                className="form-group"
                data-id={group.uid}
                aria-label={translate("{name} group", { name: label })}
              >
                <GroupHeader>
                  <IconButton
                    type="button"
                    className="group-handle"
                    disabled={disabled}
                    aria-label={translate("Reorder {name}", { name: label })}
                    title={translate(
                      "Drag to reorder, or use the Up and Down arrow keys",
                    )}
                    onKeyDown={(event) => {
                      if (
                        !["ArrowUp", "ArrowDown", "Home", "End"].includes(
                          event.key,
                        )
                      )
                        return;
                      event.preventDefault();
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? groups.length - 1
                            : index + (event.key === "ArrowUp" ? -1 : 1);
                      moveGroup(group.uid, next);
                      setMessage(translate("Group order updated."));
                    }}
                  >
                    <MoveIcon aria-hidden="true" />
                  </IconButton>
                  {editing?.uid === group.uid ? (
                    <GroupNameInput
                      ref={nameInput}
                      className="text"
                      aria-label={translate("Group name")}
                      value={group.label}
                      disabled={disabled}
                      onChange={(event) => {
                        renameGroup(group.uid, event.target.value);
                        setMessage("");
                      }}
                      onBlur={finishRename}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          event.stopPropagation();
                          renameGroup(group.uid, editing.original);
                          focusAfterRename.current = group.uid;
                          setEditing(undefined);
                        }
                      }}
                    />
                  ) : (
                    <GroupName
                      ref={(element) => {
                        if (element) renameButtons.current[group.uid] = element;
                        else delete renameButtons.current[group.uid];
                      }}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setEditing({ uid: group.uid, original: label })
                      }
                      title={translate("Rename group")}
                    >
                      {label}
                    </GroupName>
                  )}
                  <Count
                    aria-label={translate("{count} forms", {
                      count: group.forms?.length || 0,
                    })}
                  >
                    {group.forms?.length || 0}
                  </Count>
                  <IconButton
                    type="button"
                    className="group-rename"
                    disabled={disabled}
                    aria-label={translate("Rename {name}", { name: label })}
                    title={translate("Rename group")}
                    onClick={() =>
                      setEditing({ uid: group.uid, original: label })
                    }
                  >
                    <PencilIcon aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    type="button"
                    className="group-remove"
                    disabled={disabled}
                    aria-label={translate("Remove {name} group", {
                      name: label,
                    })}
                    title={translate("Remove group")}
                    onClick={() => setRemoving(group.uid)}
                  >
                    <TrashIcon aria-hidden="true" />
                  </IconButton>
                </GroupHeader>
                {removing === group.uid && (
                  <Confirmation role="alert">
                    <p>
                      {translate(
                        "Remove {name}? Its forms will move to Unassigned.",
                        { name: label },
                      )}
                    </p>
                    <div>
                      <button
                        type="button"
                        className="btn submit"
                        disabled={disabled}
                        onClick={() => {
                          removeGroup(group.uid);
                          setRemoving(undefined);
                          setUnassignedOpen(true);
                          setMessage(
                            translate(
                              "Group removed. Its forms are in Unassigned.",
                            ),
                          );
                        }}
                      >
                        {translate("Remove group")}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        disabled={disabled}
                        onClick={() => setRemoving(undefined)}
                      >
                        {translate("Keep group")}
                      </button>
                    </div>
                  </Confirmation>
                )}
                <GroupItemWrapper
                  data-group-uid={group.uid}
                  aria-label={translate("Forms in {name}", { name: label })}
                  ref={(element) =>
                    initializeGroupedSortable(
                      element,
                      group.uid,
                      refs,
                      sortHandlers,
                      isLoading,
                    )
                  }
                >
                  {!group.forms?.length && (
                    <Empty>{translate("Drop forms here")}</Empty>
                  )}
                  {group.forms?.map((form) => (
                    <FormItem
                      key={form.id}
                      form={form}
                      disabled={disabled}
                      onMove={moveTo}
                      destinations={[
                        ...destinations.filter(({ uid }) => uid !== group.uid),
                        { uid: null, label: translate("Unassigned") },
                      ]}
                    />
                  ))}
                </GroupItemWrapper>
              </GroupLayout>
            );
          })}
        </GroupWrapper>
        <UnassignedGroup aria-label={translate("Unassigned forms")}>
          <UnassignedToggle
            type="button"
            aria-expanded={unassignedOpen}
            aria-controls={unassignedId}
            onClick={() => setUnassignedOpen((open) => !open)}
            disabled={disabled}
          >
            <span aria-hidden="true">›</span>
            <span>{translate("Unassigned")}</span>
            <Count
              aria-label={translate("{count} forms", {
                count: unassigned.length,
              })}
            >
              {unassigned.length}
            </Count>
          </UnassignedToggle>
          <GroupItemWrapper
            id={unassignedId}
            hidden={!unassignedOpen}
            ref={(element) => {
              refs.current.unassigned = element;
            }}
          >
            {!unassigned.length && (
              <Empty>
                {translate("Drop forms here to leave them unassigned.")}
              </Empty>
            )}
            {unassigned.map((form) => (
              <FormItem
                key={form.id}
                form={form}
                destinations={destinations}
                disabled={disabled}
                onMove={moveTo}
              />
            ))}
          </GroupItemWrapper>
        </UnassignedGroup>
      </ManagerWrapper>
      <ManagerFooter>
        <Feedback role="status" aria-live="polite">
          {message || (dirty ? translate("Unsaved changes") : "")}
        </Feedback>
        <button
          type="button"
          className="btn cancel"
          onClick={closeModal}
          disabled={isLoading}
        >
          {translate("Cancel")}
        </button>
        <button
          type="button"
          className="btn submit"
          disabled={disabled || !dirty}
          onClick={() => {
            setErrors(undefined);
            updateMutation.mutate(payload);
          }}
        >
          <LoadingText
            loadingText={translate("Saving")}
            loading={isLoading}
            spinner
          >
            {translate("Save changes")}
          </LoadingText>
        </button>
      </ManagerFooter>
    </SlideoutContainer>
  );
};
