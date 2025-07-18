// eslint-disable no-undef
$(function () {
  checkAuth();

  const $authChecker = $('#auth-checker');
  const $status = $('.status-indicator', $authChecker);
  const id = $status.data('id');

  const $actions = $('.actions', $authChecker);
  $('a[data-action="refresh"]', $actions).on('click', (e) => {
    e.preventDefault();
    checkAuth();
  });

  $('a[data-action="authorize"]', $actions).on('click', (e) => {
    e.preventDefault();

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
        checkAuth();
      }
    });
  });
});

const checkAuth = (): void => {
  const $authChecker = $('#auth-checker');

  const $status = $('.status-indicator', $authChecker);
  const $actions = $('.actions', $authChecker);
  const $message = $('.status-message', $status);
  const $errors = $('#auth-errors');

  const id = $status.data('id');

  $('a[data-action]', $actions).hide();
  $status.attr('data-status', 'pending');
  $message.html($status.data('message-pending'));
  $errors.hide();
  $errors.html('');

  if (id) {
    $.ajax({
      url: Craft.getCpUrl(`freeform/api/integrations/${id}/status`),
      type: 'get',
      dataType: 'json',
      success: (response): void => {
        const status = response.status || 'pending';
        const errors: string[] = response.errors || undefined;

        $status.attr('data-status', status);

        const actions: string[] = [];
        let message: string;
        switch (status) {
          case 'authorized':
            message = $status.data('message-authorized');
            actions.push('refresh');
            actions.push('authorize');
            break;
          case 'unauthorized':
            message = $status.data('message-unauthorized');
            actions.push('authorize');
            break;
          case 'error':
            message = $status.data('message-error');
            actions.push('refresh');
            actions.push('authorize');
            break;
          default:
            message = $status.data('message-pending');
        }

        actions.forEach((action) => {
          $(`a[data-action="${action}"]`, $actions).css('display', 'flex');
        });

        $message.html(message);
        if (errors) {
          errors.forEach((error) => {
            let $li: JQuery;
            try {
              const json = JSON.parse(error);
              const $pre = $('<pre>').text(JSON.stringify(json, null, 2));
              $li = $('<li>').append($pre);
            } catch {
              $li = $('<li>').text(error);
            }

            $errors.append($li);
          });

          $errors.show();
        }
      },
      error: (response) => {
        $status.data('status', 'error');
        $message.html($status.data('message-error'));

        const $li = $('<li>').text(
          response.responseJSON?.message || 'An error occurred while checking the integration status.'
        );
        $errors.append($li);
        $errors.show();
      },
    });
  }
};
