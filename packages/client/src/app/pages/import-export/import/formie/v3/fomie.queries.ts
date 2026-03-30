import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { FormImportData } from "../../import.types";

export const useFormieDataQuery: () => ReturnType<
  typeof useQuery<FormImportData>
> = () => {
  return useQuery<FormImportData>({
    queryKey: ["formie", "import-data"],
    queryFn: async () => {
      const { data } = await axios.get("/import/formie/v3/data");
      return data;
    },
  });
};
