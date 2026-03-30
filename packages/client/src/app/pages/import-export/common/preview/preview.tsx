import { indexedColumn } from "@ff-client/utils/arrays";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";

import { isAllOptionsSelected } from "../../export/export.operations";
import {
  createExportOptions,
  createFilledExportOptions,
  type ExportOptions,
} from "../../export/export.types";
import type { FormImportData } from "../../import/import.types";
import { PreviewGenericList } from "./preview.generic-list";
import {
  FavoritesIcon,
  FileList,
  FormGroupIcon,
  FormIcon,
  Icon,
  PreviewWrapper,
  SelectAll,
} from "./preview.styles";
import { PreviewSettings } from "./settings/settings";
import { PreviewSubmissionsTemplates } from "./submissions/submissions";
import { PreviewTemplates } from "./templates/templates";

type Props = {
  data?: FormImportData;
  options: ExportOptions;
  disabled?: boolean;
  onUpdate: (options: ExportOptions) => void;
};

export const Preview: React.FC<Props> = ({
  data,
  options,
  disabled,
  onUpdate,
}) => {
  const isAllSelected = isAllOptionsSelected(options, data);
  const emptyOptions: ExportOptions = createExportOptions();
  const filledOptions: ExportOptions = createFilledExportOptions(data);

  return (
    <PreviewWrapper className={classes(disabled && "disabled")}>
      <FileList>
        <SelectAll
          onClick={() => {
            onUpdate(isAllSelected ? emptyOptions : filledOptions);
          }}
        >
          {translate(isAllSelected ? "Deselect All" : "Select All")}
        </SelectAll>

        <ul>
          <PreviewGenericList
            label={translate("Forms")}
            icon={<FormIcon />}
            labelKey="name"
            selectionKey="uid"
            items={data.forms}
            selection={options.forms}
            onUpdate={(forms) => onUpdate({ ...options, forms })}
            labelExtras={(form) =>
              form.pages.length > 1 && (
                <small>
                  ({translate("{count} pages", { count: form.pages.length })})
                </small>
              )
            }
          />

          <PreviewGenericList
            label={translate("Form Groups")}
            icon={<FormGroupIcon />}
            labelKey="label"
            selectionKey="uid"
            items={data.formGroups}
            selection={options.formGroups}
            onUpdate={(formGroups) => onUpdate({ ...options, formGroups })}
          />

          <PreviewGenericList
            label={translate("Favorite Fields")}
            icon={<FavoritesIcon />}
            labelKey="label"
            selectionKey="uid"
            items={data.favorites}
            selection={options.favorites}
            onUpdate={(favorites) => onUpdate({ ...options, favorites })}
          />

          <PreviewTemplates
            templates={data.templates}
            options={options.templates}
            onUpdate={(templates) => onUpdate({ ...options, templates })}
            formNames={indexedColumn(data.forms, "uid", "name")}
          />

          <PreviewGenericList
            label={translate("Integrations")}
            labelKey="name"
            selectionKey="uid"
            items={data.integrations}
            selection={options.integrations}
            onUpdate={(integrations) => onUpdate({ ...options, integrations })}
            itemIcon={(integration) => {
              if (!integration.icon) {
                return <Icon className="fa-duotone fa-gear" />;
              }

              return (
                <Icon
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(integration.icon),
                  }}
                />
              );
            }}
          />

          <PreviewSubmissionsTemplates
            submissions={data.formSubmissions}
            options={options.formSubmissions}
            onUpdate={(formSubmissions) =>
              onUpdate({ ...options, formSubmissions })
            }
          />

          <PreviewGenericList
            label={translate("Limited Users")}
            icon={<Icon className="fa-regular fa-user-shield" />}
            labelKey="name"
            selectionKey="uid"
            items={data.limitedUsers}
            selection={options.limitedUsers}
            onUpdate={(limitedUsers) => onUpdate({ ...options, limitedUsers })}
          />

          {data.settings && (
            <PreviewSettings
              value={options.settings}
              onUpdate={(settings) => onUpdate({ ...options, settings })}
            />
          )}
        </ul>
      </FileList>
    </PreviewWrapper>
  );
};
