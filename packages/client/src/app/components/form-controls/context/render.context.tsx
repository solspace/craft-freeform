import type React from "react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

export type RenderSize = "small" | "normal";

type RenderContext = {
  size: RenderSize;
  collapsibleInstructions?: readonly string[];
};

const RenderContext = createContext<RenderContext>({
  size: "normal",
});

export const RenderContextProvider: React.FC<
  PropsWithChildren<RenderContext>
> = ({ size, collapsibleInstructions, children }) => {
  return (
    <RenderContext.Provider
      value={{
        size: size ?? "normal",
        collapsibleInstructions,
      }}
    >
      {children}
    </RenderContext.Provider>
  );
};

export const useRenderContext = (): RenderContext => {
  return useContext(RenderContext);
};
