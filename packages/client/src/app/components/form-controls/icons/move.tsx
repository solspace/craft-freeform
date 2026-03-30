import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const MoveComponent = (props: SVGPropsWithTitle) => (
  <SvgTag height="1em" viewBox="0 0 448 512" {...props}>
    <path d="M336 176a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm-160 0a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM64 224a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM336 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM224 384a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM16 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z" />
  </SvgTag>
);

export default MoveComponent;
