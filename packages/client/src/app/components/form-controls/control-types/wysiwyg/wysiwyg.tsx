import React, { useMemo, useState } from 'react';
import { ButtonGroup } from '@components/elements/button-group/button-group';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { WYSIWYGProperty } from '@ff-client/types/properties';
import DOMPurify from 'dompurify';

import { WysiwygPlain } from './wysiwyg.plain';
import { WysiwygRich } from './wysiwyg.rich';
import { ButtonGroupWrapper } from './wysiwyg.styles';
import { containsHtmlTags } from './wysiwyg.utils';

enum EditorMode {
  Plain = 'plain',
  Rich = 'rich',
}

const Wysiwyg: React.FC<ControlType<WYSIWYGProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  interface CraftGlobal {
    t: (namespace: string, message: string) => string;
  }

  const t = (message: string): string =>
    (Craft as unknown as CraftGlobal).t('freeform', message);

  const initialMode = useMemo((): EditorMode => {
    if (!property.toggleEditor) {
      return EditorMode.Rich;
    }

    return containsHtmlTags(value) ? EditorMode.Rich : EditorMode.Plain;
  }, []);

  const [mode, setMode] = useState<EditorMode>(initialMode);

  const handleModeChange = (newMode: EditorMode): void => {
    setMode(newMode);

    // When switching to simple mode, strip HTML tags
    if (newMode === EditorMode.Plain && value) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = DOMPurify.sanitize(value);
      updateValue(tempDiv.textContent || '');
    }
  };

  return (
    <Control property={property} errors={errors} context={context}>
      {property.toggleEditor && (
        <ButtonGroupWrapper>
          <ButtonGroup
            value={mode}
            options={[
              { value: EditorMode.Plain, label: t('Plain Text') },
              { value: EditorMode.Rich, label: t('Rich Text') },
            ]}
            onClick={handleModeChange}
          />
        </ButtonGroupWrapper>
      )}

      {mode === EditorMode.Rich ? (
        <WysiwygRich
          value={value}
          property={property}
          updateValue={updateValue}
        />
      ) : (
        <WysiwygPlain value={value} updateValue={updateValue} />
      )}
    </Control>
  );
};

export default Wysiwyg;
