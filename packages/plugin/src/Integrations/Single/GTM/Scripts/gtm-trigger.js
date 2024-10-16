(function () {
  var form = document.querySelector('form[data-id="{{ form.anchor }}"]');
  if (form) {
    form.addEventListener('freeform-ajax-success', function (event) {
      var response = event.response;

      var pushEvent = form.freeform._dispatchEvent(
        'freeform-gtm-data-layer-push',
        { payload: {}, response: response }
      );

      var payload = {
        event: '{{ eventName }}',
        form: {
          handle: '{{ form.handle }}',
          finished: response.finished,
          multipage: response.multipage,
          success: response.success,
        },
        submission: {
          id: response.submissionId,
          token: response.submissionToken,
        },
      };

      payload = Object.assign(payload, pushEvent.payload);

      window.dataLayer.push(payload);
    });
  }
})();
