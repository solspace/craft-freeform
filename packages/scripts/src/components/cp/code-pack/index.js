const $prefix = $('#prefix');
const $components = $('#components-wrapper');
const firstFileLists = $('> div > ul.directory-structure', $components);
const $submit = $('.btn.submit');

let prefixTimeout = null;

$(function () {
  $prefix.on({
    keyup: function () {
      if (/[\\/]/gi.test($prefix.val())) {
        $prefix.addClass('error');
        $submit.addClass('disabled').prop('disabled', true).prop('readonly', true);
      } else {
        $prefix.removeClass('error');
        $submit.removeClass('disabled').prop('disabled', false).prop('readonly', false);
      }

      clearTimeout(prefixTimeout);
      prefixTimeout = setTimeout(function () {
        updateFilePrefixes();
      }, 50);
    },
  });

  updateFilePrefixes();
});

function updateFilePrefixes() {
  firstFileLists.each(function () {
    const $fileList = $(this);
    $('> li > span[data-name]', $fileList).each(function () {
      $(this).html($prefix.val() + $(this).data('name'));
    });
  });
}
