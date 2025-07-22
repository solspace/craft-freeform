type AuthWindow = (id: number, callback: () => void) => void;

export const showAuthWindow: AuthWindow = (id, callback) => {
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
    .join(',');

  const popup = window.open(url, 'OAuthFlow', optionsString);

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type === 'oauth2') {
      popup.close();
      callback();
    }
  });
};
