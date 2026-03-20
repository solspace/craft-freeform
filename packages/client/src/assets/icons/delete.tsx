import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const DeleteComponent = (props: SVGPropsWithTitle) => (
  <SvgTag height="15" viewBox="0 0 15 15" width="15" {...props}>
    <path d="m0 0h15v15h-15z" fill="none" />
    <path d="m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75" />
    <path
      d="m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </SvgTag>
);

export default DeleteComponent;
