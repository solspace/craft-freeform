import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const CheckmarkComponent = (props: SVGPropsWithTitle) => (
  <SvgTag width="14" height="14" viewBox="0 0 14 14" {...props}>
    <path
      d="M2.5 7L5.5 10L11.5 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgTag>
);

export default CheckmarkComponent;
