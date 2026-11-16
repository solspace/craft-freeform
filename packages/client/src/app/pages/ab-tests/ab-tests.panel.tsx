import { useDimensionsObserver } from "@ff-client/hooks/use-height-animation";
import { useSpring } from "@react-spring/web";
import { type FC, type PropsWithChildren, useEffect, useState } from "react";

import { CardPanel } from "./ab-tests.styles";

type Props = PropsWithChildren<{
  id: string;
  expanded: boolean;
}>;

export const ABTestPanel: FC<Props> = ({ id, expanded, children }) => {
  const { ref, dimensions } = useDimensionsObserver<HTMLDivElement>();
  const [hasOpened, setHasOpened] = useState(expanded);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );

  useEffect(() => {
    if (expanded) setHasOpened(true);
  }, [expanded]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = (): void => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const animation = useSpring({
    height: expanded ? dimensions.height : 0,
    opacity: expanded ? 1 : 0,
    immediate: reducedMotion,
    config: (key) =>
      key === "height"
        ? {
            mass: 1,
            tension: expanded ? 280 : 330,
            friction: expanded ? 22 : 30,
            clamp: !expanded,
            precision: 0.1,
          }
        : { duration: 180 },
  });

  return (
    <CardPanel
      id={id}
      style={animation}
      aria-hidden={!expanded}
      inert={!expanded}
    >
      <div ref={ref}>{(expanded || hasOpened) && children}</div>
    </CardPanel>
  );
};
