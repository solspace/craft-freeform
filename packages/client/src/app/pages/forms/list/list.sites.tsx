import React, { useState } from 'react';
import config from '@config/freeform/freeform.config';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import classes from '@ff-client/utils/classes';

import { ButtonWrapper, PopupMenu } from './list.sites.styles';
import { Button } from './list.styles';

export const ListSites: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { current, list, change } = useSiteContext();

  const {
    metadata: { craft },
    sites: { enabled },
  } = config;

  if (!enabled) {
    return null;
  }

  if (craft.is5) {
    return null;
  }

  if (list.length <= 1) {
    return null;
  }

  return (
    <div style={{ gridArea: 'sites' }}>
      <ButtonWrapper>
        <Button
          className="btn menubtn"
          data-icon="world"
          onClick={() => setOpen(!open)}
        >
          {current.name}
        </Button>

        <PopupMenu style={{ top: '100%', display: open ? 'block' : 'none' }}>
          <ul className="padded">
            {list.map((site) => (
              <li key={site.id}>
                <a
                  className={classes(
                    'menu-item',
                    current.handle === site.handle && 'sel'
                  )}
                  onClick={(event) => {
                    change(site.handle);
                    setOpen(false);

                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <span className="menu-item-label">{site.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </PopupMenu>
      </ButtonWrapper>
    </div>
  );
};
