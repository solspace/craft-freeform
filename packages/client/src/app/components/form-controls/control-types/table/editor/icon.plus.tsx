import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const IconPlusComponent = (props: SVGPropsWithTitle) => (
  <SvgTag viewBox="0 0 640 640" {...props}>
    <path d="M352 128L352 96L288 96L288 288L96 288L96 352L288 352L288 544L352 544L352 352L544 352L544 288L352 288L352 128z" />
  </SvgTag>
);

export default IconPlusComponent;
