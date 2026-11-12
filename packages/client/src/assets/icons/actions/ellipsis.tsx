import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const EllipsisComponent = (props: SVGPropsWithTitle) => (
  <SvgTag width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <circle cx="3" cy="8" r="1" fill="currentColor" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="13" cy="8" r="1" fill="currentColor" />
  </SvgTag>
);

export default EllipsisComponent;
