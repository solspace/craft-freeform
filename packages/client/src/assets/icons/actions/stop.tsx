import { type SVGPropsWithTitle, SvgTag } from "@ff-client/utils/svg";

const StopComponent = (props: SVGPropsWithTitle) => (
  <SvgTag fill="none" height="800" viewBox="0 0 24 24" width="800" {...props}>
    <g fill="#0f0f0f">
      <path d="m6 12c0 .5523.44772 1 1 1h10c.5523 0 1-.4477 1-1s-.4477-1-1-1h-10c-.55228 0-1 .4477-1 1z" />
      <path
        clipRule="evenodd"
        d="m12 23c6.0751 0 11-4.9249 11-11 0-6.07513-4.9249-11-11-11-6.07513 0-11 4.92487-11 11 0 6.0751 4.92487 11 11 11zm0-2.0068c-4.96679 0-8.99317-4.0264-8.99317-8.9932 0-4.96679 4.02638-8.99317 8.99317-8.99317 4.9668 0 8.9932 4.02638 8.9932 8.99317 0 4.9668-4.0264 8.9932-8.9932 8.9932z"
        fillRule="evenodd"
      />
    </g>
  </SvgTag>
);

export default StopComponent;
