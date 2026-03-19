import type { FC, PropsWithChildren, SVGProps } from "react";

export type SVGPropsWithTitle = SVGProps<SVGSVGElement> & {
  title?: string;
};

export const SvgTag: FC<PropsWithChildren<SVGPropsWithTitle>> = (props) => {
  const { title, children, ...svgProps } = props;

  return (
    /* biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icons are aria-hidden by default and use title when provided. */
    <svg
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {generateTitleTag(title)}
      {children}
    </svg>
  );
};

const generateTitleTag = (title?: string) => {
  if (!title?.trim()) {
    return null;
  }

  return <title>{title}</title>;
};
