import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const ChevronComponent = (props: SVGPropsWithTitle) => (
  <SvgTag
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </SvgTag>
);

export default ChevronComponent;
