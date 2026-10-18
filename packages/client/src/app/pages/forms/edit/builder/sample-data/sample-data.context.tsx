import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  resolveSamplePreview,
  type SampleGenerator,
  sampleParts,
} from "./sample-data";

type SampleDataContextValue = {
  catalog: readonly SampleGenerator[];
  byId: ReadonlyMap<string, SampleGenerator>;
  load: () => void;
  refresh: () => void;
  loading: boolean;
  error: boolean;
  optionRevision: string;
};
const emptyCatalog: readonly SampleGenerator[] = [];
const emptyMap = new Map<string, SampleGenerator>();
const SampleDataContext = createContext<SampleDataContextValue>({
  catalog: emptyCatalog,
  byId: emptyMap,
  load: () => {},
  refresh: () => {},
  loading: false,
  error: false,
  optionRevision: "0",
});

export const SampleDataProvider = ({ children }: PropsWithChildren) => {
  const { current } = useSiteContext();
  const [requested, setRequested] = useState(false);
  const [optionRevision, setOptionRevision] = useState(0);
  const load = useCallback(() => setRequested(true), []);
  const query = useQuery({
    queryKey: ["sample-data", current?.id],
    queryFn: () =>
      axios
        .get<SampleGenerator[]>("/api/sample-data", {
          params: { siteId: current?.id },
        })
        .then((response) => response.data),
    enabled: requested,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const refresh = useCallback(() => {
    setOptionRevision((revision) => revision + 1);
    if (requested) void query.refetch();
  }, [requested, query.refetch]);
  const catalog = query.data ?? emptyCatalog;
  const byId = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );
  const value = useMemo(
    () => ({
      catalog,
      byId,
      load,
      refresh,
      loading: query.isFetching,
      error: query.isError,
      optionRevision: `${current?.id}:${optionRevision}`,
    }),
    [
      catalog,
      byId,
      load,
      refresh,
      query.isFetching,
      query.isError,
      current?.id,
      optionRevision,
    ],
  );
  return (
    <SampleDataContext.Provider value={value}>
      {children}
    </SampleDataContext.Provider>
  );
};

export const useSampleData = () => useContext(SampleDataContext);

export const useSamplePreview = (
  value: unknown,
): SampleGenerator | undefined => {
  const hasSample = useMemo(
    () =>
      typeof value === "string" &&
      sampleParts(value).some((part) => part.type === "sample"),
    [value],
  );
  const { byId, load } = useSampleData();
  useEffect(() => {
    if (hasSample) load();
  }, [hasSample, load]);
  return useMemo(() => resolveSamplePreview(value, byId), [value, byId]);
};
