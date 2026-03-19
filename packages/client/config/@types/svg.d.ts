declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const Component: FC<SVGProps<SVGSVGElement> & { title?: string }>;

  export default Component;
}
