import type React from "react";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import { SiteCrumb } from "./breadcrumbs.site";
import type { Breadcrumb } from "./breadcrumbs.types";

type ContextType = {
  stack: Breadcrumb[];
  push: (crumb: Breadcrumb) => void;
  pop: (id: string) => void;
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
  const { id, label, url, external } = crumb;
  const latestCrumb = useRef(crumb);

  latestCrumb.current = { id, label, url, external };

  useEffect(() => {
    update({ id, label, url, external });
  }, [external, id, label, update, url]);

  useEffect(() => {
    push(latestCrumb.current);

    return () => {
      pop(id);
    };
  }, [id, pop, push]);
};

export const BreadcrumbProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [stack, setStack] = useState<Breadcrumb[]>([]);

  const push = useCallback((crumb: Breadcrumb): void => {
    setStack((stack) => {
      const index = stack.findIndex((item) => item.id === crumb.id);
      if (index === -1) {
        return [...stack, crumb];
      }

      const current = stack[index];
      if (
        current.label === crumb.label &&
        current.url === crumb.url &&
        current.external === crumb.external
      ) {
        return stack;
      }

      const clone = [...stack];
      clone[index] = crumb;

      return clone;
    });
  }, []);

  const pop = useCallback((id: string): void => {
    setStack((stack) => stack.filter((crumb) => crumb.id !== id));
  }, []);

  const update = useCallback((crumb: Breadcrumb): void => {
    setStack((stack) => {
      const index = stack.findIndex((item) => item.id === crumb.id);
      if (index === -1) {
        return stack;
      }

      const current = stack[index];
      if (
        current.label === crumb.label &&
        current.url === crumb.url &&
        current.external === crumb.external
      ) {
        return stack;
      }

      const clone = [...stack];
      clone[index] = {
        ...current,
        ...crumb,
      };

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
