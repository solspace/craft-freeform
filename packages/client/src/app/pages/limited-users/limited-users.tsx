import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { EmptyBlock } from "@components/empty-block/empty-block";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import config, { Edition } from "@config/freeform/freeform.config";
import { useSidebarSelect } from "@ff-client/hooks/use-sidebar-select";
import translate from "@ff-client/utils/translations";
import DeleteIcon from "@ff-icons/actions/delete";
import type React from "react";
import { Link } from "react-router-dom";

import { SettingsLayout } from "../settings/settings.layout";

import {
  useLimitedUsersDeleteMutation,
  useLimitedUsersQuery,
} from "./limited-users.queries";

export const LimitedUsers: React.FC = () => {
  const { data, isFetching } = useLimitedUsersQuery();
  const mutation = useLimitedUsersDeleteMutation();
  const isPro = config.editions.isAtLeast(Edition.Pro);

  useSidebarSelect("freeform/settings");

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb
        id="settings"
        label={translate("Settings")}
        url="."
        external
      />
      <Breadcrumb
        id="limited-users"
        label={translate("Limited Users")}
        url="settings/limited-users"
      />

      <SettingsLayout
        activeKey="limited-users"
        header={
          <HeaderContainer
            extra={
              isPro && (
                <Link to="new" className="btn submit add icon">
                  {translate("New Group")}
                </Link>
              )
            }
          >
            {translate("Limited Users")}
          </HeaderContainer>
        }
      >
        {isPro && (
          <div className="freeform-profile-table">
            {data.length > 0 && (
              <table className="cp-table cp-table--spacious cp-table--auto">
                <caption className="visually-hidden">
                  {translate("Limited Users")}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{translate("Name")}</th>
                    <th scope="col">{translate("Description")}</th>
                    <th scope="col" className="freeform-profile-actions">
                      <span className="visually-hidden">
                        {translate("Delete")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="cp-table-row">
                      <th scope="row">
                        <Link to={`${item.id}`}>{item.name}</Link>
                      </th>
                      <td className="freeform-profile-description">
                        {item.description}
                      </td>
                      <td className="freeform-profile-actions">
                        <button
                          type="button"
                          className="freeform-profile-delete"
                          disabled={mutation.isPending}
                          aria-label={`${translate("Delete")}: ${item.name}`}
                          title={translate("Delete")}
                          onClick={() => {
                            if (
                              confirm(
                                translate(
                                  "Are you sure you want to delete this?",
                                ),
                              )
                            ) {
                              mutation.mutate(item.id);
                            }
                          }}
                        >
                          <DeleteIcon aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data.length === 0 && (
              <div style={{ padding: "100px 0 100px" }}>
                <EmptyBlock
                  title={translate("No groups exist yet")}
                  subtitle={translate(
                    `Click on the "New Group" button to set up your first Limited User permission group.`,
                  )}
                />
              </div>
            )}
          </div>
        )}

        {!isPro && (
          <EmptyBlock
            lite
            title={translate(
              "Upgrade to the Freeform Pro edition to get access to the Limited Users feature.",
            )}
          />
        )}
      </SettingsLayout>
    </div>
  );
};
