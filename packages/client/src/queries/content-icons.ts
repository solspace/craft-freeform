import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useContentIconQuery = (name: string) =>
  useQuery({
    queryKey: ["content-icon", name],
    queryFn: ({ signal }) =>
      axios
        .get<{ svg: string | null }>("/api/assets/icon", {
          params: { name },
          signal,
        })
        .then((response) => response.data.svg),
    enabled: /^[a-z0-9-]{1,100}$/.test(name),
    staleTime: Infinity,
    gcTime: Infinity,
  });
