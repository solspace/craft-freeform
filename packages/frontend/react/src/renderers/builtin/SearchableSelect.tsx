import {
  SearchableSelect,
  type SearchableSelectConfig,
} from "@solspace/freeform-core";
import { type ReactNode, useEffect, useRef } from "react";

export function SearchableSelectWrapper({
  config,
  children,
}: {
  config: SearchableSelectConfig;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SearchableSelect | null>(null);
  const currentConfig = useRef(config);
  currentConfig.current = config;
  useEffect(() => {
    const select = host.current?.querySelector("select");
    if (!select) return;
    controller.current = new SearchableSelect(select, currentConfig.current);
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    controller.current?.sync(config);
  });
  return <div ref={host}>{children}</div>;
}
