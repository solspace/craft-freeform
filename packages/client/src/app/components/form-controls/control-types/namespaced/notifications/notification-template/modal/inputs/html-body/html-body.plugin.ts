import type { TinyMCE } from 'tinymce';

import { getSuggestions } from './html-body.plugin.suggestions';

export const registerFormTokens = (tinymce: TinyMCE): void => {
  tinymce.PluginManager.add('mergeTags', function (editor) {
    const store = editor.getParam('store');

    editor.ui.registry.addAutocompleter('mergeTags', {
      trigger: '@',
      minChars: 0,
      columns: 1,
      fetch: (pattern) => {
        const suggestions = getSuggestions(store);

        // Filter your suggestions based on the query.
        const matched = suggestions.filter((item) =>
          item.text.toLowerCase().includes(pattern.toLowerCase())
        );

        return Promise.resolve(matched);
      },
      onAction: (autocompleteApi, rng, value) => {
        const suggestions = getSuggestions(store);
        const text = suggestions.find((item) => item.value === value)?.text;

        editor.selection.setRng(rng);
        editor.insertContent(
          `<span contenteditable="false" data-freeform-token="${value}">${text || value}</span>`
        );

        autocompleteApi.hide();
      },
    });

    // Add a button that opens a custom dialog
    editor.ui.registry.addButton('mergeTags', {
      text: 'Merge Tags',
      onAction: function () {
        // You can open a dialog here
        editor.windowManager.open({
          title: 'Insert Merge Tag',
          body: {
            type: 'panel',
            items: [
              {
                type: 'input',
                name: 'tag',
                label: 'Merge Tag',
              },
            ],
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Close',
            },
            {
              type: 'submit',
              text: 'Insert',
              primary: true,
            },
          ],
          onSubmit: function (api) {
            const data = api.getData();
            editor.insertContent(
              '<span contenteditable="false" class="merge-tag">{{' +
                data.tag +
                '}}</span>&nbsp;'
            );
            api.close();
          },
        });
      },
    });

    return {
      getMetadata: function () {
        return {
          name: 'Merge Tags Plugin',
          url: 'https://example.com',
        };
      },
    };
  });
};
