import type {
  Integration,
  IntegrationSetting,
} from '@ff-client/types/integrations';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../store';

type IntegrationState = {
  updated: number;
  dirty: boolean;
} & Integration;

type IntegrationModificationSettingPayload = {
  id: number;
  key: string;
  value: string | number | boolean;
};

const initialState: IntegrationState[] = [];

const findIntegration = (
  state: IntegrationState[],
  id: number
): IntegrationState | undefined => {
  return state.find((item) => item.id === id);
};

const findSetting = (
  integration: IntegrationState,
  key: string
): IntegrationSetting | undefined => {
  return integration.settings.find((setting) => setting.handle === key);
};

export const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    addIntegrations: (state, action: PayloadAction<Integration[]>) => {
      action.payload.forEach((integration) => {
        state.push({
          updated: 1,
          dirty: false,
          ...integration,
        });
      });
    },
    toggleIntegration: (state, action: PayloadAction<number>) => {
      const integration = findIntegration(state, action.payload);
      integration.enabled = !integration.enabled;
    },
    modifyIntegrationSetting: (
      state,
      action: PayloadAction<IntegrationModificationSettingPayload>
    ) => {
      const { id, key, value } = action.payload;
      const integration = findIntegration(state, id);
      const setting = findSetting(integration, key);
      setting.value = value;
    },
  },
});

export const { addIntegrations, toggleIntegration, modifyIntegrationSetting } =
  integrationsSlice.actions;

export const selectIntegration =
  (id: number) =>
  (state: RootState): IntegrationState =>
    state.integrations.find((item) => item.id === id);

export default integrationsSlice.reducer;
