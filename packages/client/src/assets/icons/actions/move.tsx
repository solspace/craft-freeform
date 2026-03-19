import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const MoveComponent = (props: SVGPropsWithTitle) => (
  <SvgTag height="15" viewBox="0 0 15 15" width="15" {...props}>
    <path d="m0 0h15v15h-15z" fill="none" />
    <path d="m7.5 9.61c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z" />
    <path d="m3.57 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z" />
    <path d="m11.43 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z" />
    <path d="m7.5 1.75c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z" />
  </SvgTag>
);

export default MoveComponent;
