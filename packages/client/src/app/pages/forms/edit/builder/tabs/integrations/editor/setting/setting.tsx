import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { ControlProps } from '@ff-client/app/components/form-controls/control';
import { LightSwitch } from '@ff-client/app/components/form-controls/controls/lightswitch';
import { Text } from '@ff-client/app/components/form-controls/controls/text';
import { modifyIntegrationSetting } from '@ff-client/app/pages/forms/edit/store/slices/integrations';
import { useDebounce } from '@ff-client/hooks/use-debounce';
import type { IntegrationSetting } from '@ff-client/types/integrations';
import { SettingType } from '@ff-client/types/integrations';

type RenderSettingProps = {
  id: number;
  setting: IntegrationSetting;
};

export const Setting: React.FC<RenderSettingProps> = ({ id, setting }) => {
  const dispatch = useDispatch();

  const [localValue, setLocalValue] = useState(setting.value);
  const debouncedValue = useDebounce(localValue, 400);

  const onChange = (value: string | number | boolean): void => {
    setLocalValue(value);
  };

  useEffect(() => {
    if (debouncedValue === setting.value) {
      return;
    }

    dispatch(
      modifyIntegrationSetting({
        id,
        key: setting.handle,
        value: debouncedValue,
      })
    );
  }, [debouncedValue]);

  const props: ControlProps = {
    id: setting.handle,
    label: setting.name,
    instructions: setting.instructions,
    value: localValue,
    onChange,
  };

  switch (setting.type) {
    case SettingType.Boolean:
      return <LightSwitch {...(props as ControlProps<boolean>)} />;

    case SettingType.Text:
    default:
      return <Text {...(props as ControlProps<string>)} />;
  }
};
