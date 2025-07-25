import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import type {
  TemplateCollection,
  TemplateValues,
} from '@ff-client/app/pages/import-export/import/import.types';
import translate from '@ff-client/utils/translations';

import { PreviewGenericList } from '../preview.generic-list';
import {
  BlockItem,
  Blocks,
  Directory,
  FormattingIcon,
  Label,
  ListItem,
  NotificationIcon,
  PdfTemplateIcon,
  SuccessIcon,
  WrapperTemplateIcon,
} from '../preview.styles';

type Props = {
  templates: TemplateCollection;
  options: TemplateValues;
  onUpdate: (templates: TemplateValues) => void;
  formNames: Record<string, string>;
};

const isAllChecked = (
  templates: TemplateCollection,
  values: TemplateValues
): boolean =>
  values.pdf.length === templates.pdf.length &&
  values.wrapper.length === templates.wrapper.length &&
  values.notification.length === templates.notification.length &&
  values.formatting.length === templates.formatting.length &&
  values.success.length === templates.success.length;

export const PreviewTemplates: React.FC<Props> = ({
  templates,
  options,
  onUpdate,
}) => {
  if (
    !templates.pdf.length &&
    !templates.wrapper.length &&
    !templates.notification.length &&
    !templates.formatting.length &&
    !templates.success.length
  ) {
    return null;
  }

  return (
    <ListItem>
      <Blocks>
        <BlockItem>
          <Checkbox
            id="templates-all"
            checked={isAllChecked(templates, options)}
            onChange={() =>
              isAllChecked(templates, options)
                ? onUpdate({
                    pdf: [],
                    wrapper: [],
                    notification: [],
                    formatting: [],
                    success: [],
                  })
                : onUpdate({
                    pdf: templates.pdf.map((template) => template.uid),
                    wrapper: templates.wrapper.map((template) => template.uid),
                    notification: templates.notification.map(
                      (template) => template.uid
                    ),
                    formatting: templates.formatting.map(
                      (template) => template.fileName
                    ),
                    success: templates.success.map(
                      (template) => template.fileName
                    ),
                  })
            }
          />
        </BlockItem>
        <Directory />
        <Label htmlFor="templates-all">{translate('Templates')}</Label>
      </Blocks>

      <ul>
        <PreviewGenericList
          nested
          label={translate('PDF')}
          labelKey={'name'}
          icon={<PdfTemplateIcon />}
          items={templates.pdf}
          selection={options.pdf}
          selectionKey="uid"
          onUpdate={(pdf) => onUpdate({ ...options, pdf })}
        />

        <PreviewGenericList
          nested
          label={translate('Wrapper')}
          labelKey={'name'}
          icon={<WrapperTemplateIcon />}
          items={templates.wrapper}
          selection={options.wrapper}
          selectionKey="uid"
          onUpdate={(wrapper) => onUpdate({ ...options, wrapper })}
        />

        <PreviewGenericList
          nested
          label={translate('Notification')}
          labelKey={'name'}
          icon={<NotificationIcon />}
          items={templates.notification}
          selection={options.notification}
          selectionKey="uid"
          onUpdate={(notification) => onUpdate({ ...options, notification })}
        />

        <PreviewGenericList
          nested
          label={translate('Formatting')}
          labelKey={'name'}
          icon={<FormattingIcon />}
          items={templates.formatting}
          selection={options.formatting}
          selectionKey="fileName"
          onUpdate={(formatting) => onUpdate({ ...options, formatting })}
        />

        <PreviewGenericList
          nested
          label={translate('Success')}
          labelKey={'name'}
          icon={<SuccessIcon />}
          items={templates.success}
          selection={options.success}
          selectionKey="fileName"
          onUpdate={(success) => onUpdate({ ...options, success })}
        />
      </ul>
    </ListItem>
  );
};
