import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const ChevronComponent = (props: SVGPropsWithTitle) => (
  <SvgTag height="1em" viewBox="0 0 320 512" {...props}>
    <path d="M305 239c9.4 9.4 9.4 24.6 0 33.9L113 465c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l175-175L79 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L305 239z" />
  </SvgTag>
);

export default ChevronComponent;
