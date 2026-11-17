import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type ActivityAlertsResponse = {
  errors: number;
  errorLog: "activity" | null;
  activityRetentionDays: number | null;
  warningLogs: {
    log: "activity";
    count: number;
  }[];
};

export const useActivityAlertsQuery =
  (): UseQueryResult<ActivityAlertsResponse> => {
    return useQuery({
      queryKey: ["activity-alerts"],
      queryFn: () =>
        axios
          .get<ActivityAlertsResponse>("/api/activity-alerts")
          .then((res) => res.data),
    });
  };
