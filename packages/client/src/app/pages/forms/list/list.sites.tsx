import React, { useState } from 'react';
import { PopupMenu } from '@components/breadcrumbs/breadcrumbs.site.style';
import config from '@config/freeform/freeform.config';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import classes from '@ff-client/utils/classes';

import { Button } from './list.styles';
import { ButtonWrapper } from './lit.sites.styles';

export const ListSites: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { current, list, change } = useSiteContext();
  const ref = useClickOutside<HTMLDivElement>({
    callback: () => setOpen(false),
    isEnabled: open,
  });

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
      <ButtonWrapper ref={ref}>
        <Button
          className="btn menubtn sitemenubtn"
          data-icon="world"
          onClick={() => setOpen(!open)}
        >
          {current.name}
        </Button>

        <PopupMenu
          className="menu"
          style={{ top: '100%', display: open ? 'block' : 'none' }}
        >
          <ul className="padded">
            {list.map((site) => (
              <li
                key={site.id}
                onClick={() => {
                  change(site.handle);
                  setOpen(false);
                }}
              >
                <a
                  className={classes(
                    'menu-item',
                    current.handle === site.handle && 'sel'
                  )}
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
