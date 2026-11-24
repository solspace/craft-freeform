import type { ReactNode } from "react";
import { useId } from "react";

import { Button, Count, Wrapper } from "./grid/archived/archived.styles";

type Props = {
  title: string;
  label: string;
  icon: ReactNode;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export const FormListDisclosure = ({
  title,
  label,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: Props) => {
  const panelId = useId();

  return (
    <Wrapper>
      <h2>
        <Button
          type="button"
          id={`${panelId}-heading`}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={count === undefined ? label : `${label} (${count})`}
          onClick={onToggle}
        >
          {icon}
          <span>{title}</span>
          {count !== undefined && <Count>{count}</Count>}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="archive-chevron"
          >
            <path
              d="m6 4 4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </h2>
      <section
        id={panelId}
        aria-labelledby={`${panelId}-heading`}
        hidden={!expanded}
      >
        {expanded && children}
      </section>
    </Wrapper>
  );
};
