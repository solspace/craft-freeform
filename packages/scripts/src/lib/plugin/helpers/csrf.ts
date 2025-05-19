type CSRFToken = { name: string; value: string };
type TokenResponse = {
  csrf?: CSRFToken;
};

let globalCsrf: CSRFToken;

enum RefreshType {
  None = 'none',
  Once = 'once',
  Always = 'always',
}

export const fetchCsrf = async (): Promise<CSRFToken> => {
  try {
    const form = document.querySelector<HTMLFormElement>('form[data-csrf-refresh]');
    if (!form) {
      return null;
    }

    const tokenRefreshType = form.dataset.csrfRefresh;
    switch (tokenRefreshType) {
      case RefreshType.Once:
        if (globalCsrf === undefined) {
          globalCsrf = await fetchCsrfTokenPayload();
        }

        return globalCsrf;

      case RefreshType.Always:
        return await fetchCsrfTokenPayload();

      case RefreshType.None:
      default:
        return null;
    }
  } catch {
    // Do Nothing
  }

  return null;
};

const fetchCsrfTokenPayload = async (): Promise<CSRFToken | null> => {
  const url: string = '/freeform/tokens';

  const data = (await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  }).then((res) => res.json())) as TokenResponse;

  if (data.csrf !== undefined) {
    return {
      name: data.csrf.name,
      value: data.csrf.value,
    };
  }

  return null;
};

export const updateCsrfInputs = async (): Promise<void> => {
  const elements = document.querySelectorAll('craft-csrf-input');
  if (!elements) {
    return;
  }

  const csrf = await fetchCsrf();
  if (csrf === null) {
    return;
  }

  const { name, value } = csrf;
  elements.forEach((element) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    element.replaceWith(input);
  });
};
