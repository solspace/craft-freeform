import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { EmptyBlock } from "@components/empty-block/empty-block";
import { EmptyState } from "@components/empty-state/empty-state";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import config, { Edition } from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import DeleteIcon from "@ff-icons/actions/delete";
import type React from "react";
import { Link } from "react-router-dom";

import { SettingsLayout } from "../settings/settings.layout";
import {
  useLimitedUsersDeleteMutation,
  useLimitedUsersQuery,
} from "./limited-users.queries";
import { SettingsPage } from "./limited-users.styles";

export const LimitedUsers: React.FC = () => {
  const { data, isFetching, isError, refetch } = useLimitedUsersQuery();
  const mutation = useLimitedUsersDeleteMutation();
  const isPro = config.editions.isAtLeast(Edition.Pro);
  const canManage = isPro && config.permissions?.settings === true;

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <SettingsPage>
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
              canManage && (
                <Link to="new" className="btn submit add icon">
                  {translate("New Profile")}
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
            {data && data.length > 0 && (
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
                        {canManage ? (
                          <Link to={`${item.id}`}>{item.name}</Link>
                        ) : (
                          item.name
                        )}
                      </th>
                      <td className="freeform-profile-description">
                        {item.description}
                      </td>
                      <td className="freeform-profile-actions">
                        {canManage && (
                          <button
                            type="button"
                            className="freeform-profile-delete"
                            disabled={mutation.isPending}
                            aria-label={`${translate("Delete")}: ${item.name}`}
                            title={translate("Delete")}
                            onClick={() => {
                              if (
                                confirm(
                                  translate("Delete this permission profile?"),
                                )
                              ) {
                                mutation.mutate(item.id);
                              }
                            }}
                          >
                            <DeleteIcon aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {isError && !data && (
              <EmptyState
                framed={false}
                title={translate("Unable to load profiles")}
                description={translate(
                  "Please try again to load your Limited Users profiles.",
                )}
                icon={<LimitedUsersIcon />}
              >
                <button type="button" className="btn" onClick={() => refetch()}>
                  {translate("Try again")}
                </button>
              </EmptyState>
            )}
            {data?.length === 0 && (
              <EmptyState
                framed={false}
                title={translate(
                  canManage
                    ? "Create your first Limited Users profile"
                    : "No Limited Users profiles yet",
                )}
                description={translate(
                  "Simplify the form builder for your team. Choose which fields, settings, and tabs each profile allows, then assign the profile through Craft user permissions.",
                )}
                icon={<LimitedUsersIcon />}
              >
                {canManage && (
                  <Link to="new" className="btn submit">
                    {translate("Create profile")}
                  </Link>
                )}
                <a
                  href="https://docs.solspace.com/craft/freeform/v5/configuration/limited-users/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate("View documentation")}
                </a>
              </EmptyState>
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
    </SettingsPage>
  );
};

const LimitedUsersIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    focusable="false"
  >
    <circle cx="13" cy="11" r="4" />
    <path
      d="M5 26v-3a8 8 0 0 1 12-7M22 6a4 4 0 0 1 0 8M21 19l5-2 5 2v5c0 3-5 6-5 6s-5-3-5-6z"
      transform="translate(-2 0)"
    />
  </svg>
);
