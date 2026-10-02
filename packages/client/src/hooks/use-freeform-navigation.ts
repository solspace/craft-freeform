import { QKForms } from "@ff-client/queries/forms";
import { QKIntegrations } from "@ff-client/queries/integrations";
import { QKNotifications } from "@ff-client/queries/notifications";
import {
  findFreeformNavLink,
  isPlainNavigation,
  selectFreeformNavLink,
  withCurrentSite,
} from "@ff-client/utils/craft-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const useFreeformNavigation = (): void => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname, search } = useLocation();

  useEffect(() => selectFreeformNavLink(pathname), [pathname]);

  useEffect(() => {
    const link = findFreeformNavLink("/freeform/forms");
    const onClick = (event: MouseEvent): boolean => {
      if (!isPlainNavigation(event)) return true;
      event.preventDefault();

      if (formId) {
        queryClient.invalidateQueries({
          queryKey: QKForms.single(Number(formId)),
        });
        queryClient.invalidateQueries({
          queryKey: QKNotifications.single(Number(formId)),
        });
        queryClient.invalidateQueries({
          queryKey: QKIntegrations.form(Number(formId)),
        });
      }

      navigate(withCurrentSite("/forms", search));

      return false;
    };

    if (link) {
      link.addEventListener("click", onClick);
    }

    return () => {
      if (link) {
        link.removeEventListener("click", onClick);
      }
    };
  }, [formId, navigate, queryClient, search]);

  useEffect(() => {
    const link = findFreeformNavLink("/freeform/integrations");
    const onClick = (event: MouseEvent): boolean => {
      if (!isPlainNavigation(event)) return true;
      event.preventDefault();
      navigate(withCurrentSite("/integrations", search));

      return false;
    };

    if (link) {
      link.addEventListener("click", onClick);
    }

    return () => {
      if (link) {
        link.removeEventListener("click", onClick);
      }
    };
  }, [navigate, search]);

  useEffect(() => {
    const link = findFreeformNavLink("/freeform/ab-tests");
    const onClick = (event: MouseEvent): boolean => {
      if (!isPlainNavigation(event)) return true;
      event.preventDefault();
      navigate(withCurrentSite("/ab-tests", search));

      return false;
    };

    if (link) {
      link.addEventListener("click", onClick);
    }

    return () => {
      if (link) {
        link.removeEventListener("click", onClick);
      }
    };
  }, [navigate, search]);
};
