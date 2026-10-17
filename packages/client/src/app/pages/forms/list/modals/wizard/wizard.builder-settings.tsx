import { Sidebar } from "@components/layout/sidebar/sidebar";
import config from "@config/freeform/freeform.config";
import { FieldComponent } from "@editor/builder/tabs/form-settings/field-component";
import {
  FormSettingsContainer,
  SectionContainer,
  SectionHeader,
} from "@editor/builder/tabs/form-settings/settings.editor.styles";
import {
  SectionIcon,
  SectionLink,
  SectionWrapper,
} from "@editor/builder/tabs/form-settings/settings.sidebar.styles";
import type { FormSettingNamespace } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";

export function WizardBuilderSettingsSidebar({
  namespaces,
  section,
}: {
  namespaces: FormSettingNamespace[];
  section: string;
}) {
  return (
    <Sidebar $lean>
      <SectionWrapper>
        {namespaces
          .flatMap((namespace) => namespace.sections)
          .filter((item) =>
            config.limitations.can(`settings.tab.${item.handle}`),
          )
          .map((item) => (
            <SectionLink
              key={item.handle}
              type="button"
              data-builder-section={item.handle}
              className={item.handle === section ? "active" : undefined}
            >
              <SectionIcon
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.icon || ""),
                }}
              />
              {translate(item.label)}
            </SectionLink>
          ))}
      </SectionWrapper>
    </Sidebar>
  );
}

export function WizardBuilderSettings({
  namespaces,
  section,
}: {
  namespaces: FormSettingNamespace[];
  section: string;
}) {
  const namespace = namespaces.find((namespace) =>
    namespace.sections.some((item) => item.handle === section),
  );
  const selected = namespace?.sections.find((item) => item.handle === section);
  if (!namespace || !selected) return null;
  return (
    <FormSettingsContainer data-builder-target="settings">
      <SectionHeader>{translate(selected.label)}</SectionHeader>
      <SectionContainer>
        {namespace.properties
          .filter(
            (property) =>
              property.section === section &&
              property.visible &&
              property.handle !== "allowHtmlEmbeds",
          )
          .map((property) => (
            <div
              key={property.handle}
              style={{ width: "100%" }}
              data-builder-setting={property.handle}
            >
              <FieldComponent
                namespace={namespace.handle}
                property={property}
              />
            </div>
          ))}
      </SectionContainer>
    </FormSettingsContainer>
  );
}
