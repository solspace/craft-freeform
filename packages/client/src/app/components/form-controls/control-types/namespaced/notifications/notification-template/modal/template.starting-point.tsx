import { useModal } from "@components/modals/modal.context";
import translate from "@ff-client/utils/translations";
import { useId, useState } from "react";
import styled from "styled-components";
import tinymce from "tinymce/tinymce";

import type { PushState } from "./template.modal";
import type {
  NotificationTemplateDefaults,
  TemplateSampleFields,
} from "./template.modal.queries";

const fields = ["name", "handle", "description", "subject", "body"] as const;
const pickFields = (source: PushState): TemplateSampleFields =>
  Object.fromEntries(
    fields.map((field) => [field, source[field] || ""]),
  ) as TemplateSampleFields;

type Props = {
  defaults: NotificationTemplateDefaults;
  value: PushState;
  onChange: (fields: TemplateSampleFields) => void;
};

export function TemplateStartingPoint({ defaults, value, onChange }: Props) {
  const id = useId();
  const { confirm } = useModal();
  const [selected, setSelected] = useState("");
  const [baseline, setBaseline] = useState(() => pickFields(defaults));
  const options = [
    {
      id: "",
      name: translate("Default template"),
      fields: pickFields(defaults),
    },
    ...(defaults.samples || []),
  ];

  const choose = (sampleId: string) => {
    const option = options.find((option) => option.id === sampleId);
    if (!option) return;
    const apply = () => {
      onChange(option.fields);
      setBaseline(option.fields);
      setSelected(sampleId);
    };
    const comparable = (field: (typeof fields)[number], content: string) => {
      const editor = tinymce.activeEditor;
      return field === "body" && editor?.initialized
        ? editor.serializer.serialize(editor.dom.create("div", {}, content), {
            getInner: true,
          })
        : content;
    };
    if (
      fields.some(
        (field) =>
          comparable(field, value[field] || "") !==
          comparable(field, baseline[field]),
      )
    ) {
      confirm({
        title: translate("Use this starting point?"),
        message: translate(
          "Your changes to the template name and content will be replaced.",
        ),
        confirmLabel: translate("Use template"),
        destructive: false,
        onConfirm: apply,
      });
    } else {
      apply();
    }
  };

  return (
    <Picker>
      <label htmlFor={id}>{translate("Start from")}</label>
      <div className="select">
        <select
          id={id}
          value={selected}
          onChange={(event) => choose(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </Picker>
  );
}

const Picker = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  margin-bottom: 16px;

  > label { font-weight: 700; }
  select { max-width: 100%; }
`;
