import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Consume the Welcome action before opening, so Back and refresh do not reopen it. */
export function useWelcomeFormStart(
  canCreate: boolean,
  openAddForm: () => void,
): void {
  const location = useLocation();
  const navigate = useNavigate();
  const consumed = useRef(new Set<string>());

  useEffect(() => {
    const state: unknown = location.state;
    if (
      !state ||
      typeof state !== "object" ||
      !("welcomeStart" in state) ||
      state.welcomeStart !== true ||
      consumed.current.has(location.key)
    )
      return;
    consumed.current.add(location.key);
    const { welcomeStart: _, ...rest } = state;
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: Object.keys(rest).length ? rest : null,
    });
    if (canCreate) openAddForm();
  }, [canCreate, location, navigate, openAddForm]);
}
