import { useParams } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

import type {
  SurveyChart,
  SurveyData,
  SurveyPreferences,
} from './results.types';

export const QKSurveyResults = {
  all: ['surveys', 'results'] as const,
  single: (handle: string) => [...QKSurveyResults.all, handle] as const,
  preferences: () => [...QKSurveyResults.all, 'preferences'] as const,
  chart: (handle: string) =>
    [...QKSurveyResults.single(handle), 'chart'] as const,
};

type RouteParams = {
  handle: string;
};

export const useQuerySurveyResults = (): UseQueryResult<
  SurveyData,
  AxiosError
> => {
  const { handle } = useParams<RouteParams>();

  return useQuery<SurveyData, AxiosError>(
    QKSurveyResults.single(handle),
    () =>
      axios
        .get<SurveyData>(`/api/surveys/form/${handle}`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      enabled: !!handle,
    }
  );
};

export const useQuerySurveyPreferences = (): UseQueryResult<
  SurveyPreferences,
  AxiosError
> => {
  const { handle } = useParams<RouteParams>();

  return useQuery<SurveyPreferences, AxiosError>(
    QKSurveyResults.preferences(),
    () =>
      axios.get(`/api/surveys/preferences/${handle}`).then((res) => res.data),
    { staleTime: Infinity }
  );
};

export const useQuerySurveyChart = (): UseQueryResult<
  SurveyChart,
  AxiosError
> => {
  const { handle } = useParams<RouteParams>();

  return useQuery(
    QKSurveyResults.chart(handle),
    () => axios.get(`/api/surveys/chart/${handle}`).then((res) => res.data),
    { staleTime: Infinity }
  );
};
