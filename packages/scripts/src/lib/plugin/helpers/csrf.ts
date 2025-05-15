let csrf: { name: string; value: string } | null;

type CsrfResponse = { name: string; value: string };

export const fetchCsrf = async (): Promise<CsrfResponse> => {
  if (csrf === undefined) {
    let response: Response;
    try {
      const form = document.querySelector<HTMLFormElement>('form[data-csrf-info]');
      let url: string;
      if (form) {
        url = form.dataset.csrfInfo;
      }

      if (!url) {
        url = '/index.php?p=actions/users/session-info';
      }

      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();
      if (data.csrfTokenName !== undefined) {
        csrf = {
          name: data.csrfTokenName,
          value: data.csrfTokenValue,
        };
      } else {
        csrf = null;
      }
    } catch {
      csrf = null;
    }
  }

  return csrf;
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
