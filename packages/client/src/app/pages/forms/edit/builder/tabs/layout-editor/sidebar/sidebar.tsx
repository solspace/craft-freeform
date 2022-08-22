import React, { useState } from 'react';
import { useSpring } from 'react-spring';

import { BaseFields } from './field-list/base-fields/base-fields';
import { Container, Wrapper } from './sidebar.styles';
import { useFieldSearch } from './hooks/use-field-search';

const expand = { width: 400 };
const collapse = { width: 25, overflow: 'hidden' };

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useFieldSearch();

  const style = useSpring({
    to: collapsed ? collapse : expand,
  });

  return (
    <Wrapper style={style}>
      <Container>
        <div>query: {query}</div>

        <input
          type="text"
          value={query}
          onChange={(event): void => {
            setQuery(event.target.value);
          }}
        />
        <BaseFields />
      </Container>
    </Wrapper>
  );
};
