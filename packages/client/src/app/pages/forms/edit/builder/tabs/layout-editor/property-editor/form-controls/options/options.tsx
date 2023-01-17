import React, { useState } from 'react';
import { config, useSpring } from 'react-spring';
import { Control } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/control';
import {
  Button,
  Buttons,
  WrapperEditor,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options.styles';
import OptionsEditor from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-editor';
import OptionsPreview from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-preview';
import { WrapperPreview } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-preview.styles';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';

const Options: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid, properties } = field;
  const value = properties[handle];

  const [editorVisible, setEditorVisible] = useState(false);

  const style = useSpring({
    config: { ...config.default },
    from: {
      opacity: 0,
      scale: 0,
    },
    to: {
      opacity: editorVisible ? 1 : 0,
      scale: editorVisible ? 1 : 0,
    },
  });

  const ref = useClickOutside<HTMLDivElement>(
    () => setEditorVisible(false),
    editorVisible
  );

  if (!editorVisible) {
    return (
      <Control property={property}>
        <WrapperPreview onClick={() => setEditorVisible(true)}>
          <OptionsPreview value={value} />
        </WrapperPreview>
      </Control>
    );
  }

  return (
    <Control property={property}>
      <WrapperEditor ref={ref} style={style}>
        <Buttons>
          <Button onClick={() => setEditorVisible(false)}>
            <CloseIcon />
          </Button>
        </Buttons>
        <OptionsEditor
          value={value}
          handle={handle}
          onChange={(value) => dispatch(edit({ uid, property, value }))}
        />
      </WrapperEditor>
    </Control>
  );
};

export default Options;
