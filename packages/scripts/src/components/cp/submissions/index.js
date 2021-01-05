// eslint-disable no-undef

$(function () {
  const $statusSelect = $('#status-menu-btn');
  const menu = $statusSelect.data('menubtn');

  if (menu) {
    menu.setSettings({
      onOptionSelect: function (data) {
        const id = $(data).data('id');
        const name = $(data).data('name');
        const color = $(data).data('color');
        const $status = $('#status-menu-select');

        $('#statusId').val(id);
        const html = "<span class='status " + color + "'></span>" + Craft.uppercaseFirst(name);
        $statusSelect.html(html);

        $status.find('li a.sel').removeClass('sel');
        $status.find('li a[data-id=' + id + ']').addClass('sel');
      },
    });
  }

  const $assetDownloadForm = $('form#asset_download');
  $('#content').on(
    {
      click: function () {
        const { assetId } = $(this).data();

        $('input[name=assetId]', $assetDownloadForm).val(assetId);
        $assetDownloadForm.submit();
      },
    },
    'a[data-asset-id]'
  );

  $('canvas[data-image]').each(function () {
    const canvas = $(this)[0];
    const img = new window.Image();
    img.addEventListener('load', () => {
      canvas.getContext('2d').drawImage(img, 0, 0);
    });
    img.setAttribute('src', $(this).data('image'));
  });

  const signatureLinksWrapper = $('.download-signature-links');
  $('a[data-type]', signatureLinksWrapper).on('click', function () {
    const canvas = $(this).parents('.signature-wrapper').find('canvas:first')[0];
    const type = $(this).data('type');

    const link = document.createElement('a');
    link.download = `signature.${type}`;
    link.href = canvas.toDataURL(`image/${type}`).replace(`image/${type}`, 'image/octet-stream');
    link.click();

    return false;
  });

  $('#export-btn').remove();

  $('#delete-button').on('click', function () {
    if (!confirm(Craft.t('freeform', 'Are you sure you want to delete this?'))) {
      return;
    }

    $(this).attr('disabled', true).addClass('disabled').text('Deleting...');

    const id = $(this).data('id');
    $.ajax({
      type: 'post',
      url: Craft.getCpUrl('freeform/spam/delete'),
      dataType: 'json',
      data: {
        id,
        [Craft.csrfTokenName]: Craft.csrfTokenValue,
      },
      success: (response) => {
        if (response.success) {
          window.location.href = Craft.getCpUrl('freeform/spam');
        } else {
          console.error('Could not delete spam submission');
        }
      },
    });
  });
});
