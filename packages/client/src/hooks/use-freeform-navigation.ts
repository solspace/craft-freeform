import { QKForms } from "@ff-client/queries/forms";
import { QKIntegrations } from "@ff-client/queries/integrations";
import { QKNotifications } from "@ff-client/queries/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const useFreeformNavigation = (): void => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const link = findLink("/freeform/forms");
    const onClick = (event: MouseEvent): boolean => {
      event.preventDefault();

      if (formId) {
        queryClient.invalidateQueries({
          queryKey: QKForms.single(Number(formId)),
        });
        queryClient.invalidateQueries({
          queryKey: QKNotifications.single(Number(formId)),
        });
        queryClient.invalidateQueries({
          queryKey: QKIntegrations.single(Number(formId)),
        });
      }

      navigate("/forms");

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
  }, [formId, navigate, queryClient]);

  useEffect(() => {
    const link = findLink("/freeform/integrations");
    const onClick = (event: MouseEvent): boolean => {
      event.preventDefault();
      navigate("/integrations");

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
  }, [navigate]);

  useEffect(() => {
    const link = findLink("/freeform/ab-tests");
    const onClick = (event: MouseEvent): boolean => {
      event.preventDefault();
      navigate("/ab-tests");

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
  }, [navigate]);
};

const findLink = (path: string): HTMLAnchorElement | null => {
  // Craft 5
  let link = document.querySelector<HTMLAnchorElement>(
    `ul.nav-item__subnav li a[href*="${path}"]`,
  );

  if (!link) {
    // Craft 4
    link = document.querySelector<HTMLAnchorElement>(
      `ul.subnav li a[href*="${path}"]`,
    );
  }

  return link;
};
