import React, { useState } from 'react';
import { config, useSpring } from 'react-spring';
import { Control } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/control';
import {
  Button,
  Buttons,
  WrapperEditor,
  WrapperPreview,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table.styles';
import TableLayoutEditor from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-layout-editor';
import TableLayoutPreview from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-layout-preview';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';

const Table: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle, options: types } = property;
  const { uid, properties } = field;
  const options = properties[handle];

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
          <TableLayoutPreview
            types={types}
            options={options}
            onChange={(value) => dispatch(edit({ uid, property, value }))}
          />
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
        <TableLayoutEditor
          types={types}
          handle={handle}
          options={options}
          onChange={(value) => dispatch(edit({ uid, property, value }))}
        />
      </WrapperEditor>
    </Control>
  );
};

export default Table;
