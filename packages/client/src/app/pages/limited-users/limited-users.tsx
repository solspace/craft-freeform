import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { EmptyBlock } from "@components/empty-block/empty-block";
import { EmptyState } from "@components/empty-state/empty-state";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import config, { Edition } from "@config/freeform/freeform.config";
import { useSidebarSelect } from "@ff-client/hooks/use-sidebar-select";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { Link } from "react-router-dom";

import { SettingsSidebar } from "../settings/settings.sidebar";

import {
  useLimitedUsersDeleteMutation,
  useLimitedUsersQuery,
} from "./limited-users.queries";
import { ContentContainer } from "./limited-users.styles";

export const LimitedUsers: React.FC = () => {
  const { data, isFetching, isError, refetch } = useLimitedUsersQuery();
  const mutation = useLimitedUsersDeleteMutation();
  const isPro = config.editions.isAtLeast(Edition.Pro);
  const canManage = isPro && config.permissions?.settings === true;
  const isCraft5 = config.metadata.craft.is5;

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

      <HeaderContainer
        extra={
          canManage && (
            <Link to="new" className="btn submit add icon">
              {translate("New Group")}
            </Link>
          )
        }
      >
        {translate("Limited Users")}
      </HeaderContainer>

      <div id="main-content" className="has-sidebar">
        <SettingsSidebar activeKey="limited-users" />
        <ContentContainer
          id="content-container"
          className={classes(!isCraft5 && "craft-4")}
        >
          <div id="content" className="content-pane">
            {isPro && (
              <div className="tablepane">
                {data && data.length > 0 && (
                  <table className="data fullwidth">
                    <thead>
                      <tr>
                        <th>{translate("Name")}</th>
                        <th>{translate("Description")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.id}>
                          <th>
                            {canManage ? (
                              <Link to={`${item.id}`}>{item.name}</Link>
                            ) : (
                              item.name
                            )}
                          </th>
                          <td>{item.description}</td>
                          <td className="thin">
                            {canManage && (
                              <a
                                className="delete icon"
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
                              />
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
                    title={translate("Unable to load groups")}
                    description={translate(
                      "Please try again to load your Limited Users groups.",
                    )}
                    icon={<LimitedUsersIcon />}
                  >
                    <button
                      type="button"
                      className="btn"
                      onClick={() => refetch()}
                    >
                      {translate("Try again")}
                    </button>
                  </EmptyState>
                )}
                {data?.length === 0 && (
                  <EmptyState
                    framed={false}
                    title={translate(
                      canManage
                        ? "Create your first Limited Users group"
                        : "No Limited Users groups yet",
                    )}
                    description={translate(
                      "Simplify the form builder for your team. Choose which fields, settings, and tabs each group can use, then assign the group to users.",
                    )}
                    icon={<LimitedUsersIcon />}
                  >
                    {canManage && (
                      <Link to="new" className="btn submit">
                        {translate("Create group")}
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
          </div>
        </ContentContainer>
      </div>
    </div>
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
