import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import String from '@components/form-controls/control-types/string/string';
import Textarea from '@components/form-controls/control-types/textarea/textarea';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import type { ABTestWithVariants } from '../ab-tests.types';

import { Variants } from './variants/variants';
import { EditorLoader } from './editor.loader';
import { useAbTest, useAbTestMutation } from './editor.queries';
import { EditorContainer, EditorWrapper } from './editor.styles';

export const AbTestsEditor: FC = () => {
  const { id } = useParams();
  const { data, isFetching } = useAbTest(id);
  const mutation = useAbTestMutation(id);

  const [state, setState] = useState<ABTestWithVariants>({
    id: undefined,
    name: '',
    description: '',
    variants: [],
  });

  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  useEffect(() => {
    if (id === 'new') {
      setState({
        id: undefined,
        name: '',
        description: '',
        variants: [],
      });
    }
  }, [id]);

  if (!data && isFetching) {
    return <EditorLoader />;
  }

  return (
    <EditorContainer>
      <Breadcrumb
        id={`ab-tests-editor`}
        label={`${state?.name || translate('New A/B Test')}`}
        url={`/ab-tests/${id || 'new'}`}
      />

      <EditorWrapper>
        <String
          value={state?.name ?? ''}
          updateValue={(value) =>
            setState((prev) => ({ ...prev!, name: value }))
          }
          property={{
            type: PropertyType.String,
            handle: 'name',
            label: 'Name',
          }}
        />

        <Textarea
          value={state?.description ?? ''}
          updateValue={(value) =>
            setState((prev) => ({ ...prev!, description: value }))
          }
          property={{
            type: PropertyType.Textarea,
            handle: 'description',
            label: translate('Description'),
            rows: 4,
          }}
        />

        <Variants
          variants={state.variants}
          updateVariants={(variants) =>
            setState((prev) => ({ ...prev, variants }))
          }
        />

        <button
          onClick={() => mutation.mutate(state!)}
          type="button"
          className="btn submit"
        >
          {translate('Save')}
        </button>
      </EditorWrapper>
    </EditorContainer>
  );
};
