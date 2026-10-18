import config, { Edition } from "@config/freeform/freeform.config";
import type { Property } from "@ff-client/types/properties";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";
import type { WizardOptions } from "./wizard/wizard.types";

const QKFormModal = {
  all: ["form", "modal"] as const,
};

export const useFormCreationAvailability = () =>
  useQuery<{ canCreate: boolean }, AxiosError>({
    queryKey: ["form-creation-availability"],
    queryFn: () =>
      axios
        .get<{ canCreate: boolean }>("/api/forms/creation-availability")
        .then(({ data }) => data),
    enabled: config.editions.edition === Edition.Express,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

type FetchFormModalQuery = () => UseQueryResult<Property[], AxiosError>;

export const useFetchFormModalType: FetchFormModalQuery = () => {
  return useQuery<Property[], AxiosError>({
    queryKey: QKFormModal.all,
    queryFn: () =>
      axios.get<Property[]>(`/api/forms/modal`).then((res) => res.data),
    staleTime: Infinity,
  });
};

export const useFormStartingPoints = () =>
  useQuery<WizardOptions, AxiosError>({
    queryKey: ["form-wizard-options"],
    queryFn: () =>
      axios.get<WizardOptions>("/api/forms/wizard").then(({ data }) => data),
    staleTime: 60_000,
    retry: 1,
  });
