import React, { useRef } from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import DomToImage from 'dom-to-image';

import { useQuerySurveyResults } from '../results.queries';

import { Block } from './block/block';
import { Container, Heading, Wrapper } from './result-list.styles';

export const ResultList: React.FC = () => {
  const ref = useRef<HTMLUListElement>(null);
  const { data, isFetching } = useQuerySurveyResults();

  if (isFetching) {
    return 'Loading...';
  }

  const onExport = (): void => {
    if (!data) {
      return;
    }

    DomToImage.toPng(ref.current).then(async (dataUrl) => {
      const url = generateUrl('/export/surveys/pdf');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [Craft.csrfTokenName]: Craft.csrfTokenValue,
          image: dataUrl,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const blob = await res.blob();
      const urlObj = window.URL || window.webkitURL;
      const objectUrl = urlObj.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;

      // Try to read filename from Content-Disposition if server sets it
      const disp = res.headers.get('Content-Disposition') || '';
      const match = /filename\*?=(?:UTF-8'')?["']?([^"';\s]+)["']?/i.exec(disp);
      const suggestedName = match?.[1]
        ? decodeURIComponent(match[1])
        : 'survey-results.pdf';

      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup
      setTimeout(() => urlObj.revokeObjectURL(objectUrl), 1000);
    });
  };

  return (
    <>
      <Breadcrumb
        id="survey-list"
        label={data.form.name}
        url={`/surveys/${data.form.handle}`}
      />

      <Wrapper ref={ref}>
        <Container>
          <Heading>
            {translate('{count} Responses', { count: data.form.submissions })}
            <small>
              ({translate('{count} questions', { count: data.results.length })})
            </small>
          </Heading>

          <button className="btn" onClick={onExport}>
            {translate('Export as PDF')}
          </button>
        </Container>

        {data.results.map((fieldResults, index) => (
          <Block
            key={fieldResults.field.id}
            {...fieldResults}
            responses={data.form.submissions}
            bulletin={index + 1}
          />
        ))}
      </Wrapper>
    </>
  );
};
