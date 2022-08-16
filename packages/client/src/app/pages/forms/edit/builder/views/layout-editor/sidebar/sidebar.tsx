import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSpring } from 'react-spring';

import { useDebounce } from '@ff-client/hooks/use-debounce';

import {
  Search,
  selectQuery,
  updateQuery,
} from '../../../../store/slices/search';
import { BaseFields } from './field-list/base-fields/base-fields';
import { Container, Wrapper } from './sidebar.styles';

const expand = { width: 400 };
const collapse = { width: 25, overflow: 'hidden' };

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useDispatch();

  const query = useSelector(selectQuery(Search.Fields));
  const [localQuery, setLocalQuery] = useState(query);
  const debouncedQuery = useDebounce(localQuery, 100);

  useEffect(() => {
    dispatch(updateQuery({ type: Search.Fields, query: debouncedQuery }));
  }, [debouncedQuery]);

  const style = useSpring({
    to: collapsed ? collapse : expand,
  });

  return (
    <Wrapper style={style}>
      <Container>
        <div>redux: {query}</div>
        <div>local: {localQuery}</div>
        <div>debounced: {debouncedQuery}</div>

        <input
          type="text"
          value={localQuery}
          onChange={(event): void => {
            setLocalQuery(event.target.value);
          }}
        />
        <BaseFields />
      </Container>
    </Wrapper>
  );
};
