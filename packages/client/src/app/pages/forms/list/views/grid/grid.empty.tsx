import config from "@config/freeform/freeform.config";
import type { FormWithStats } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { useCreateFormModal } from "../../modals/hooks/use-create-form-modal";

import { Card } from "./card/card";
import { chartDataset } from "./grid.empty.datasets";
import { MutedWrapper } from "./grid.empty.styles";

const color = "#e0e0e0";
const generateFormData = (
  name: string,
  description: string,
  chartData: Array<{ uv: number }>,
  submissions: number,
  spam: number,
): FormWithStats => ({
  uid: "",
  type: "",
  name,
  handle: "",
  description,
  isNew: true,
  chartData,
  links: [
    {
      count: submissions,
      label: translate("{count} Submissions", { count: submissions }),
      handle: "submissions",
      type: "linkList",
      url: "",
      internal: false,
    },
    {
      count: spam,
      label: translate("{count} Spam", { count: spam }),
      handle: "spam",
      type: "linkList",
      url: "",
      internal: true,
    },
  ],
  counters: {
    submissions,
    spam,
  },
  formMonitor: {
    enabled: false,
  },
  settings: {
    general: {
      namespaceType: "settings",
      namespace: "general",
      color,
    },
  },
  dateArchived: null,
});

export const GridEmpty: React.FC = () => {
  const openCreateFormModal = useCreateFormModal();
  const { canCreate } = config.metadata.freeform;

  return (
    <div>
      {canCreate && (
        <>
          <p>
            {translate(
              `You don't have any forms yet. Create your first form now...`,
            )}
          </p>

          <button
            type="button"
            className="btn submit add icon"
            onClick={openCreateFormModal}
          >
            {translate("Create a new Form")}
          </button>
        </>
      )}

      {!canCreate && <p>{translate(`You don't have any forms.`)}</p>}

      <MutedWrapper>
        <Card
          form={generateFormData(
            "Contact Form",
            "Main contact form.",
            chartDataset[0],
            14,
            5,
          )}
        />
        <Card
          form={generateFormData(
            "Customer Survey",
            "Customer satisfaction survey.",
            chartDataset[1],
            72,
            18,
          )}
        />
        <Card
          form={generateFormData(
            "Newsletter",
            "Newsletter signup form.",
            chartDataset[2],
            138,
            7,
          )}
        />
      </MutedWrapper>
    </div>
  );
};
