// eslint-disable no-undef
$(() => {
  $('.alert-dismissible a.close').on({
    click: (event) => {
      const link = event.target.href;
      const $alert = $(event.target).parents('.alert:first');

      Craft.postActionRequest(link, {}, () => $alert.remove());

      event.stopPropagation();
      event.preventDefault();
      return false;
    },
  });
});
