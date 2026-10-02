import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { useSaveShortcut } from "@ff-client/hooks/use-save-shortcut";
import { useSidebarSelect } from "@ff-client/hooks/use-sidebar-select";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SettingsLayout } from "../settings/settings.layout";

import {
  useLimitedUsersMutation,
  useLimitedUsersSingleQuery,
} from "./limited-users.queries";
import { GroupWrapper, List, ProfileFields } from "./limited-users.styles";
import { ItemBlock } from "./limited-users.sub-components";
import type { Item, RecursiveUpdate } from "./limited-users.types";

export const LimitedUsersDetail: React.FC = () => {
  const { id } = useParams();
  const { data, isFetching } = useLimitedUsersSingleQuery(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState([]);
  const mutation = useLimitedUsersMutation(id);

  useSidebarSelect("freeform/settings");

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDescription(data.description);
      setState(data.items);
    }
  }, [data]);

  const updateValue: RecursiveUpdate = (id, updates): void => {
    const updateItem = (items: Item[], path?: string): Item[] => {
      return items.map((item) => {
        const currentPath = path ? `${path}.${item.id}` : item.id;
        if (currentPath === id) {
          return { ...item, ...updates };
        }

        if (item.children) {
          return {
            ...item,
            children: updateItem(item.children, currentPath),
          };
        }

        return item;
      });
    };

    setState((prev) => updateItem(prev));
  };

  const triggerSave =
    (goBack: boolean = true) =>
    (): void => {
      mutation.mutate(
        { name, description, items: state },
        {
          onSuccess: () => {
            if (goBack) {
              navigate(`/settings/limited-users`);
            }

            notifications.success(translate("Permission saved successfully."));
          },
        },
      );
    };

  useSaveShortcut(triggerSave(false));

  if (!data && isFetching) {
    return <div>{translate("Loading...")}</div>;
  }

  return (
    <div>
      <Breadcrumb
        id="settings"
        label={translate("Settings")}
        url=".."
        external
      />
      <Breadcrumb
        id="limited-users"
        label={translate("Limited Users")}
        url="settings/limited-users"
      />
      <Breadcrumb
        id="limited-users-id"
        label={data?.name}
        url={`settings/limited-users/${id}`}
      />

      <SettingsLayout
        activeKey="limited-users"
        header={<HeaderContainer>{translate("Limited Users")}</HeaderContainer>}
        footer={
          <button
            type="button"
            className="btn submit"
            disabled={mutation.isPending}
            onClick={triggerSave()}
          >
            <LoadingText
              loading={mutation.isPending}
              loadingText={translate("Saving")}
              spinner
            >
              {translate("Save")}
            </LoadingText>
          </button>
        }
      >
        <GroupWrapper>
          <ProfileFields>
            <div className="profile-field">
              <div className="heading">
                <label htmlFor="limited-user-name">{translate("Name")}</label>
                <div className="instructions" id="limited-user-name-help">
                  {translate("Enter the name of the limited user permission.")}
                </div>
              </div>
              <div className="input">
                <input
                  id="limited-user-name"
                  className="cp-form-control"
                  type="text"
                  aria-describedby="limited-user-name-help"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>
            <div className="profile-field">
              <div className="heading">
                <label htmlFor="limited-user-description">
                  {translate("Description")}
                </label>
                <div
                  className="instructions"
                  id="limited-user-description-help"
                >
                  {translate("Enter a description for this permission.")}
                </div>
              </div>
              <div className="input">
                <textarea
                  id="limited-user-description"
                  className="cp-form-control"
                  aria-describedby="limited-user-description-help"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>
          </ProfileFields>

          <List>
            {state.map((item) => (
              <ItemBlock key={item.id} item={item} updateValue={updateValue} />
            ))}
          </List>
        </GroupWrapper>
      </SettingsLayout>
    </div>
  );
};
