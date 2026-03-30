import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const AddIconComponent = (props: SVGPropsWithTitle) => (
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
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </SvgTag>
);

export default AddIconComponent;
