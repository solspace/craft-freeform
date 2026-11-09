import { useModal } from "@components/modals/modal.context";
import translate from "@ff-client/utils/translations";
import { type RefObject, useCallback, useEffect } from "react";

/** Guard ordinary page links as well as the guide's Back control. */
export function useSetupExit({
  dirty,
  saving,
  leaveAllowed,
}: {
  dirty: boolean;
  saving: boolean;
  leaveAllowed: RefObject<boolean>;
}) {
  const { confirm } = useModal();
  const requestExit = useCallback(
    (leave: () => void) => {
      if (saving) return;
      const proceed = () => {
        leaveAllowed.current = true;
        leave();
      };
      if (!dirty || leaveAllowed.current) {
        proceed();
        return;
      }
      confirm({
        title: translate("Leave the setup guide?"),
        message: translate(
          "Your setup choices have not been applied. Leave the guide and discard them?",
        ),
        confirmLabel: translate("Leave setup"),
        destructive: false,
        onConfirm: proceed,
      });
    },
    [dirty, saving, leaveAllowed, confirm],
  );
  useEffect(() => {
    const onLink = (event: MouseEvent) => {
      if (
        (!dirty && !saving) ||
        leaveAllowed.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !link ||
        (link.target && !["_self", "_top", "_parent"].includes(link.target)) ||
        link.hasAttribute("download")
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.href === window.location.href ||
        (url.origin === location.origin &&
          url.pathname === location.pathname &&
          url.search === location.search)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      requestExit(() => window.location.assign(url.href));
    };
    document.addEventListener("click", onLink, true);
    return () => document.removeEventListener("click", onLink, true);
  }, [dirty, saving, leaveAllowed, requestExit]);
  return requestExit;
}
