import { colors } from "@ff-client/styles/variables";
import { SvgTag } from "@ff-client/utils/svg";
import translate from "@ff-client/utils/translations";
import { animated, useSpring } from "@react-spring/web";
import type { ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 -8px;
`;
const Group = styled.div<{ $open: boolean }>`
  border-radius: 5px;
  background: ${({ $open }) => ($open ? colors.gray100 : colors.white)};
`;
const Heading = styled.h3`
  margin: 0;
  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    box-sizing: border-box;
    width: 100%;
    min-height: 40px;
    padding: 9px 12px;
    border: 1px solid rgba(51, 64, 77, 0.06);
    border-radius: 4px;
    background: ${colors.white};
    color: ${colors.gray700};
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    text-align: left;
    cursor: pointer;
    transition: background 140ms ease-out, color 140ms ease-out;
    svg { display: block; flex: none; width: 12px; height: 12px; color: currentColor; }
    .section-icon { width: 16px; height: 16px; }
    &[aria-expanded="true"] {
      background: ${colors.gray600};
      border-color: ${colors.gray600};
      border-radius: 4px 4px 0 0;
      color: ${colors.white};
    }
    &[aria-expanded="false"]:hover { background: ${colors.gray100}; }
    &:focus-visible { outline: 2px solid ${colors.blue800}; outline-offset: 2px; }
  }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
`;
const HeadingLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;
const headingIcons: Record<string, ReactNode> = {
  Layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M11 4v16" />
    </>
  ),
  Section: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M7 13h10M7 17h6" />
    </>
  ),
  Cards: (
    <>
      <rect x="3" y="5" width="8" height="14" rx="1.5" />
      <rect x="13" y="5" width="8" height="14" rx="1.5" />
      <path d="M5.5 10h3M5.5 13h3M15.5 10h3M15.5 13h3" />
    </>
  ),
  "Links & Buttons": (
    <>
      <path d="m10 13 4-4M8 15l-1.5 1.5a3.5 3.5 0 0 1-5-5L6 7a3.5 3.5 0 0 1 5 0M13 17a3.5 3.5 0 0 0 5 0l4.5-4.5a3.5 3.5 0 0 0-5-5L16 9" />
    </>
  ),
};

const Body = styled(animated.div)`
  overflow: hidden;
  border-radius: 0 0 4px 4px;
  background: ${colors.gray100};
  box-shadow: inset 1px 0 rgba(51, 64, 77, 0.06), inset -1px 0 rgba(51, 64, 77, 0.06), inset 0 -1px rgba(51, 64, 77, 0.06);
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 10px 14px;
`;

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
};

const DesignGroup = ({
  label,
  content,
  expanded,
  immediate,
  onToggle,
}: {
  label: string;
  content: ReactNode;
  expanded: boolean;
  immediate: boolean;
  onToggle: () => void;
}) => {
  const id = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const body = useSpring({
    height: expanded ? height : 0,
    opacity: expanded ? 1 : 0,
    immediate,
    config: (key) =>
      key === "height"
        ? { mass: 0.8, tension: 300, friction: 20, clamp: !expanded }
        : { tension: 300, friction: 28, clamp: true },
  });
  const chevron = useSpring({
    rotation: expanded ? 90 : 0,
    immediate,
    config: { tension: 320, friction: 18 },
  });
  return (
    <Group $open={expanded}>
      <Heading>
        <button
          id={`${id}-heading`}
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
        >
          <HeadingLabel>
            {headingIcons[label] && (
              <SvgTag
                className="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {headingIcons[label]}
              </SvgTag>
            )}
            <span>{translate(label)}</span>
          </HeadingLabel>
          <animated.svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            style={{
              transform: immediate
                ? `rotate(${expanded ? 90 : 0}deg)`
                : chevron.rotation.to((angle) => `rotate(${angle}deg)`),
            }}
          >
            <path
              d="m4 2 4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </animated.svg>
        </button>
      </Heading>
      <Body
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-heading`}
        aria-hidden={!expanded}
        inert={!expanded}
        style={
          immediate
            ? { height: expanded ? height : 0, opacity: expanded ? 1 : 0 }
            : body
        }
      >
        <Content ref={contentRef}>{content}</Content>
      </Body>
    </Group>
  );
};

export const LayoutDesignGroups = ({
  groups,
  defaultGroup,
}: {
  groups: { label: string; content: ReactNode }[];
  defaultGroup: string;
}) => {
  const [open, setOpen] = useState<string | null>(defaultGroup);
  const [interacted, setInteracted] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <Groups>
      {groups.map(({ label, content }) => (
        <DesignGroup
          key={label}
          label={label}
          content={content}
          expanded={open === label}
          immediate={reducedMotion || !interacted}
          onToggle={() => {
            setInteracted(true);
            setOpen(open === label ? null : label);
          }}
        />
      ))}
    </Groups>
  );
};
