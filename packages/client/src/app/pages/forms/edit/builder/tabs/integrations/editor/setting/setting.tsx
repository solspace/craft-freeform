import type React from 'react';
import type { IntegrationSetting } from '@ff-client/types/integrations';

type RenderSettingProps = {
  id: number;
  setting: IntegrationSetting;
};

// TODO: remove this
export const Setting: React.FC<RenderSettingProps> = ({ id, setting }) => {
  return null;
  // const dispatch = useDispatch();

  // const [localValue, setLocalValue] = useState(setting.value);
  // const debouncedValue = useDebounce(localValue, 400);

  // const onChange = (value: string | number | boolean): void => {
  //   setLocalValue(value);
  // };

  // useEffect(() => {
  //   if (debouncedValue === setting.value) {
  //     return;
  //   }

  //   dispatch(
  //     modifyIntegrationSetting({
  //       id,
  //       key: setting.handle,
  //       value: debouncedValue,
  //     })
  //   );
  // }, [debouncedValue]);

  // const props: ControlProps = {
  //   id: setting.handle,
  //   label: setting.name,
  //   instructions: setting.instructions,
  //   value: localValue,
  //   onChange,
  // };

  // switch (setting.type) {
  //   case SettingType.Boolean:
  //     return <Bool {...(props as ControlProps<boolean>)} />;

  //   case SettingType.Text:
  //   default:
  //     return <Text {...(props as ControlProps<string>)} />;
  // }
};
