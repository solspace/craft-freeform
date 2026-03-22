import cloneDeep from "lodash/cloneDeep";
import type React from "react";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import { SiteCrumb } from "./breadcrumbs.site";
import type { Breadcrumb } from "./breadcrumbs.types";

type ContextType = {
  stack: Breadcrumb[];
  push: (crumb: Breadcrumb) => void;
  pop: () => void;
  update: (crumb: Breadcrumb) => void;
};

const BreadcrumbContext = createContext<ContextType>({
  stack: [],
  push: () => void {},
  pop: () => void {},
  update: () => void {},
});

export const useBreadcrumbs = (crumb: Breadcrumb): void => {
  const { push, pop, update } = useContext(BreadcrumbContext);

  useEffect(() => {
    update(crumb);
  }, [crumb, update]);

  useEffect(() => {
    push(crumb);

    return () => {
      pop();
    };
  }, [crumb, push, pop]);
};

export const BreadcrumbProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [stack, setStack] = useState<Breadcrumb[]>([]);

  const push = useCallback((crumb: Breadcrumb): void => {
    setStack((stack) => [...stack, crumb]);
  }, []);

  const pop = useCallback((): void => {
    setStack((stack) => stack.slice(0, -1));
  }, []);

  const update = useCallback((crumb: Breadcrumb): void => {
    setStack((stack) => {
      const index = stack?.findIndex((c) => c.id === crumb.id);
      if (index === undefined || index === -1 || !crumb) {
        return stack;
      }

      if (
        stack[index].label === crumb.label ||
        stack[index].url === crumb.url
      ) {
        return stack;
      }

      const clone = cloneDeep(stack);
      clone[index].url = crumb.url;
      clone[index].label = crumb.label;

      return clone;
    });
  }, []);

  useEffect(() => {
    const crumbs = document.getElementById("crumbs");
    crumbs.style.display = "block";
    crumbs.style.overflow = "initial";
    crumbs.classList.remove("empty");
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ stack, push, pop, update }}>
      {children}
      {createPortal(
        <nav aria-label="Breadcrumbs" className="breadcrumbs">
          <ul id="crumb-list" className="breadcrumb-list">
            <SiteCrumb />
            {stack.map(({ label, url, external }, i) => (
              <li key={i} className="crumb">
                {external && <a href={url}>{label}</a>}
                {!external && <Link to={url}>{label}</Link>}
              </li>
            ))}
          </ul>
        </nav>,
        document.getElementById("crumbs"),
      )}
      {}
    </BreadcrumbContext.Provider>
  );
};
