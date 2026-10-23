import config, { Edition } from "@config/freeform/freeform.config";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type {
  DashboardWidgetSize,
  FormWithStats,
} from "@ff-client/types/forms";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useState } from "react";

export const getExtraWidgetSizes = (type: string) => {
  const sizes: {
    size: DashboardWidgetSize;
    label: string;
    dimensions: string;
  }[] = [];
  if (type === "linear" || type === "recent")
    sizes.push({ size: "3x2", label: "Extra wide", dimensions: "3×2" });
  if (type === "quick-form" || type === "recent" || type === "radial")
    sizes.push({ size: "2x3", label: "Extra tall", dimensions: "2×3" });
  if (["linear", "recent", "radial", "quick-form"].includes(type))
    sizes.push({ size: "3x3", label: "Extra large", dimensions: "3×3" });
  return sizes;
};

export type DashboardWidget = {
  uid: string;
  type: string;
  revision?: string;
  title: string;
  size: DashboardWidgetSize;
  groupUid: string | null;
  beforeId: number | null;
};
export type WidgetPlacement = Pick<
  DashboardWidget,
  "uid" | "size" | "groupUid" | "beforeId"
>;
export type WidgetList = { groupUid: string | null; ids: string[] };
const emptyWidgets: DashboardWidget[] = [];
export const widgetKey = (siteId?: number) => [
  "form-dashboard-widgets",
  siteId,
];
export const placementsFromLists = (
  lists: WidgetList[],
  widgets: DashboardWidget[],
): WidgetPlacement[] =>
  lists.flatMap((list) =>
    list.ids.flatMap((id, index) => {
      const widget = widgets.find((widget) => `widget-${widget.uid}` === id);
      if (!widget) return [];
      const nextForm = list.ids.slice(index + 1).find((id) => /^\d+$/.test(id));
      return [
        {
          uid: widget.uid,
          size: widget.size,
          groupUid: list.groupUid,
          beforeId: nextForm ? Number(nextForm) : null,
        },
      ];
    }),
  );
export const mergeWidgetCards = (
  forms: FormWithStats[],
  widgets: DashboardWidget[],
) => {
  const ids = new Set(forms.map((form) => form.id));
  return [
    ...forms.flatMap((form) => [
      ...widgets.filter((widget) => widget.beforeId === form.id),
      form,
    ]),
    ...widgets.filter(
      (widget) => widget.beforeId === null || !ids.has(widget.beforeId),
    ),
  ];
};
export const useDashboardWidgets = () => {
  const { current } = useSiteContext();
  const siteId = current?.id;
  const client = useQueryClient();
  const [isSaving, setSaving] = useState(false);
  const busy = useRef(false);
  const query = useQuery({
    queryKey: widgetKey(siteId),
    queryFn: ({ signal }) =>
      axios
        .get<{
          items: DashboardWidget[];
          types: { type: string; name: string }[];
        }>("/api/forms/widgets", { params: { siteId }, signal })
        .then((r) => r.data),
    enabled: !!siteId && config.editions.isAtLeast(Edition.Pro),
    retry: false,
  });
  const reload = () =>
    client.invalidateQueries({ queryKey: widgetKey(siteId) });
  const mutate = async (path: string, values: object) => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    const key = widgetKey(siteId);
    try {
      await client.cancelQueries({ queryKey: key });
      await axios.post(path, { siteId, ...values });
      await client.invalidateQueries({ queryKey: key });
    } catch (error) {
      notifications.error(
        translate("Could not save the widget layout. Please try again."),
      );
      throw error;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const save = (placements: WidgetPlacement[]) =>
    mutate("/api/forms/widgets/layout", { placements });
  return {
    ...query,
    siteId,
    items: query.data?.items ?? emptyWidgets,
    isSaving,
    reload,
    save,
    resize: (widget: DashboardWidget, size: DashboardWidgetSize) =>
      save(
        (query.data?.items ?? []).map((item) => ({
          uid: item.uid,
          size: item.uid === widget.uid ? size : item.size,
          groupUid: item.groupUid,
          beforeId: item.beforeId,
        })),
      ),
    remove: (uid: string) => mutate("/api/forms/widgets/remove", { uid }),
  };
};
