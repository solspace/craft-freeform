import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const EllipsisComponent = (props: SVGPropsWithTitle) => (
  <SvgTag width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8Z"
      fill="currentColor"
    />
    <path
      d="M10 8C10 8.55228 9.55228 9 9 9C8.44772 9 8 8.55228 8 8C8 7.44772 8.44772 7 9 7C9.55228 7 10 7.44772 10 8Z"
      fill="currentColor"
    />
    <path
      d="M15 8C15 8.55228 14.5523 9 14 9C13.4477 9 13 8.55228 13 8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8Z"
      fill="currentColor"
    />
  </SvgTag>
);

export default EllipsisComponent;
