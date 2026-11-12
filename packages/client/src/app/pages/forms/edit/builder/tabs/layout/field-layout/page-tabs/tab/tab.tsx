import { TranslateIconWrapper } from "@components/form-controls/label.styles";
import { useModal } from "@components/modals/modal.context";
import type { Page } from "@editor/builder/types/layout";
import { useAppDispatch } from "@editor/store";
import { contextActions } from "@editor/store/slices/context";
import { contextSelectors } from "@editor/store/slices/context/context.selectors";
import { pageActions } from "@editor/store/slices/layout/pages";
import { pageSelecors } from "@editor/store/slices/layout/pages/pages.selectors";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { deletePage } from "@editor/store/thunks/pages";
import { useClickOutside } from "@ff-client/hooks/use-click-outside";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import CloseIcon from "@ff-icons/actions/delete";
import TranslateIcon from "@ff-icons/translate.icon";
import type React from "react";
import type { KeyboardEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { useTabDrop } from "./tab.drop";
import {
  Input,
  PageTab,
  RemoveTabButton,
  RemoveTabSlot,
  TabText,
  TabWrapper,
} from "./tab.styles";

type Props = {
  page: Page;
  index: number;
};

export const Tab: React.FC<Props> = ({ page, index }) => {
  const currentPage = useSelector(contextSelectors.currentPage);
  const totalPages = useSelector(pageSelecors.count);

  const dispatch = useAppDispatch();
  const { confirmDelete } = useModal();
  const {
    willTranslate,
    updateTranslation,
    getTranslation,
    hasTranslation,
    removeTranslation,
  } = useTranslations(page);

  const pageHasErrors = useSelector(contextSelectors.hasErrors(page.uid));

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { canDrop, ref: dropRef } = useTabDrop(currentPage?.uid, page);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const persistInputChanges = (): void => {
    const newLabel = inputRef.current.value || page.label;
    if (!updateTranslation("label", newLabel)) {
      dispatch(
        pageActions.updateLabel({
          uid: page.uid,
          label: newLabel,
        }),
      );
    }
  };

  const handleKeyboardEvent = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Enter") {
      persistInputChanges();
      setIsEditing(false);
    }

    if (event.key === "Escape") {
      setIsEditing(false);
    }
  };

  const clickOutsideRef = useClickOutside<HTMLDivElement>({
    callback: (): void => {
      persistInputChanges();
      setIsEditing(false);
    },
    isEnabled: isEditing,
  });

  const connectedRef = dropRef(
    wrapperRef,
  ) as unknown as RefObject<HTMLDivElement>;

  return (
    <TabWrapper
      ref={connectedRef}
      className="page-tab sortable-page-tab"
      data-page-index={index}
    >
      <PageTab
        ref={clickOutsideRef}
        className={classes(
          currentPage?.uid === page.uid && "active",
          pageHasErrors && "errors",
          canDrop && "can-drop",
          isEditing && "is-editing",
        )}
        onClick={(): void => {
          dispatch(contextActions.setPage(page.uid));
        }}
        onDoubleClick={(): void => setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            type="text"
            ref={inputRef}
            className="page-label-input"
            size={Math.max(1, getTranslation("label", page.label).length)}
            placeholder={page.label}
            defaultValue={getTranslation("label", page.label)}
            onKeyUp={handleKeyboardEvent}
          />
        ) : (
          <TabText>
            <span>{getTranslation("label", page.label)}</span>
            {willTranslate("label") && (
              <TranslateIconWrapper
                className={classes(hasTranslation("label") && "active")}
                onClick={(event): void => {
                  if (!hasTranslation("label")) return;
                  event.preventDefault();
                  event.stopPropagation();
                  confirmDelete({
                    title: translate("Remove translation?"),
                    message: translate(
                      "Are you sure you want to remove the translation?",
                    ),
                    confirmLabel: translate("Remove translation"),
                    onConfirm: () => removeTranslation("label"),
                  });
                }}
              >
                <TranslateIcon />
              </TranslateIconWrapper>
            )}
          </TabText>
        )}

        {totalPages > 1 && !isEditing && (
          <RemoveTabSlot>
            <RemoveTabButton
              type="button"
              aria-label={translate("Delete page {name}", {
                name: getTranslation("label", page.label),
              })}
              title={translate("Delete page")}
              onClick={(event) => {
                event.stopPropagation();
                confirmDelete({
                  title: translate("Delete page?"),
                  message: translate(
                    'Are you sure you want to delete "{name}"? All fields on this page will also be removed.',
                    { name: getTranslation("label", page.label) },
                  ),
                  onConfirm: () => {
                    dispatch(deletePage(page));
                  },
                });
              }}
            >
              <CloseIcon />
            </RemoveTabButton>
          </RemoveTabSlot>
        )}
      </PageTab>
    </TabWrapper>
  );
};
