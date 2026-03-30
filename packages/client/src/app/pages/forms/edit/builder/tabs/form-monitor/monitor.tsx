import { useFMFormTestsQuery } from "@ff-client/queries/form-monitor";
import type React from "react";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import { MonitorWrapper } from "./monitor.styles";
import { List } from "./sidebar/list";

export const FormMonitor: React.FC = () => {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const ITEMS_PER_PAGE = 100;
  const currentPage = Number(searchParams.get("page")) || 1;
  const offset = currentPage > 0 ? (currentPage - 1) * ITEMS_PER_PAGE : 0;

  const formTestsQuery = useFMFormTestsQuery(Number(formId), {
    limit: ITEMS_PER_PAGE,
    offset,
  });

  return (
    <MonitorWrapper>
      <List formTestsQuery={formTestsQuery} />
      <Outlet context={{ formTestsQuery }} />
    </MonitorWrapper>
  );
};
