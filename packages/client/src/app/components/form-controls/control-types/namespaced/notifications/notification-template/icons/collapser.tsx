import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const CollapserComponent = (props: SVGPropsWithTitle) => (
  <SvgTag viewBox="0 0 512 512" {...props}>
    <path d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z" />
  </SvgTag>
);

export default CollapserComponent;
