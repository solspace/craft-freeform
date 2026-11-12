import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const CheckIcon = (props: SVGPropsWithTitle) => (
  <SvgTag viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="m3 8 3.25 3.25L13 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgTag>
);

export default CheckIcon;
