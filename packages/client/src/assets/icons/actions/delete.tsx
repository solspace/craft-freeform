import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const DeleteComponent = (props: SVGPropsWithTitle) => (
  <SvgTag width="14" height="14" viewBox="0 0 14 14" {...props}>
    <path
      d="M3 3L11 11M11 3L3 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </SvgTag>
);

export default DeleteComponent;
