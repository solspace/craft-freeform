type AuthWindow = (
  id: number,
  callback: () => void,
  onError?: () => void,
) => () => void;

export const showAuthWindow: AuthWindow = (id, callback, onError) => {
  const url = Craft.getCpUrl(`freeform/integrations/${id}/authorize`);
  const width = 600;
  const height = 700;

  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const options = {
    width,
    height,
    top,
    left,
    toolbar: 0,
    menubar: 0,
  } as const;

  const optionsString = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  const popup = window.open(url, "OAuthFlow", optionsString);

  if (!popup) {
    onError?.();
    return () => {};
  }

  const cleanup = (): void => {
    window.removeEventListener("message", listener);
    window.clearInterval(closedCheck);
  };

  const listener = (event: MessageEvent): void => {
    if (event.origin !== window.location.origin || event.source !== popup) {
      return;
    }

    if (event.data?.type === "oauth2") {
      cleanup();
      if (event.data.status === "error") {
        onError?.();
      } else {
        popup.close();
        callback();
      }
    }
  };

  window.addEventListener("message", listener);
  const closedCheck = window.setInterval(() => {
    if (popup.closed) {
      cleanup();
      onError?.();
    }
  }, 500);
  return cleanup;
};
