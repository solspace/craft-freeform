import { SvgTag } from "@ff-client/utils/svg";
import type React from "react";

type Props = {
  direction: "undo" | "redo";
};

export const HistoryArrow: React.FC<Props> = ({ direction }) => (
  <SvgTag viewBox="0 0 96 80" width="18" height="16">
    <g
      transform={
        direction === "redo" ? "translate(96 0) scale(-1 1)" : undefined
      }
    >
      <path
        fill="currentColor"
        d="M37 1 1 30l36 29V41h18c15 0 23 8 23 22 0 6-2 11-5 16 12-8 19-19 19-31 0-20-14-31-37-31H37V1Z"
      />
    </g>
  </SvgTag>
);
