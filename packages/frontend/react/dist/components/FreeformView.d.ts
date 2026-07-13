import type { UseFreeformResult } from "../types.js";

type LoadedFreeformResult = UseFreeformResult & {
  manifest: NonNullable<UseFreeformResult["manifest"]>;
};
type FreeformViewProps = {
  form: LoadedFreeformResult;
  className?: string;
};
export declare function FreeformView({
  form,
  className,
}: FreeformViewProps): import("react").JSX.Element;
//# sourceMappingURL=FreeformView.d.ts.map
