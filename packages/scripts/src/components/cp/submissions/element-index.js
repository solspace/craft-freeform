// eslint-disable no-undef
if (typeof Craft.Freeform === typeof undefined) {
  Craft.Freeform = {};
}

const getDefaultSourceKey = function () {
  // Did they request a specific category group in the URL?
  var defaultFormHandle = window.defaultFormHandle;
  if (this.settings.context === 'index' && typeof defaultFormHandle !== 'undefined') {
    for (var i = 0; i < this.$sources.length; i++) {
      var $source = $(this.$sources[i]);

      if ($source.data('handle') === defaultFormHandle) {
        return $source.data('key');
      }
    }
  }

  return this.base();
};

const updateButton = function () {
  if (!this.$source) {
    return;
  }

  const handle = this.$source.data('handle');
  if (this.settings.context === 'index' && typeof history !== 'undefined') {
    let uri = this.baseUrl;

    if (handle) {
      uri += '/' + handle;
    }

    history.replaceState({}, '', Craft.getUrl(uri));
  }
};

Craft.Freeform.SubmissionsIndex = Craft.BaseElementIndex.extend({
  baseUrl: 'freeform/submissions',

  afterInit: function () {
    this.on('selectSource', $.proxy(this, 'updateButton'));
    this.on('selectSite', $.proxy(this, 'updateButton'));

    this.base();
  },
  getViewClass: function (mode) {
    switch (mode) {
      case 'table':
        return Craft.Freeform.SubmissionsTableView;
      default:
        return this.base(mode);
    }
  },
  getDefaultSort: function () {
    return ['dateCreated', 'desc'];
  },
  getDefaultSourceKey,
  updateButton,
});

Craft.Freeform.SpamSubmissionsIndex = Craft.BaseElementIndex.extend({
  baseUrl: 'freeform/spam',
  reasonContainer: null,
  reasonMenuBtn: null,
  selectedReason: null,

  getDefaultSourceKey,
  afterInit: function () {
    this.reasonContainer = $('<div></div>');
    this.reasonContainer.append($('#spam-reasons').html());
    this.reasonMenuBtn = $('.btn.menubtn', this.reasonContainer);

    this.$statusMenuContainer.before(this.reasonContainer);

    $('*[data-reason]', this.reasonContainer).on({
      click: (event) => {
        const { target } = event;
        const reason = $(target).data('reason');
        const label = $(target).text();

        $(target).addClass('sel').parent().siblings().find('a').removeClass('sel');

        this.reasonMenuBtn.text(label);
        this.selectedReason = reason;

        this.settings.criteria = {
          ...this.settings.criteria,
          spamReason: reason,
        };

        this.updateElements();
      },
    });

    this.on('selectSource', $.proxy(this, 'updateButton'));
    this.on('selectSite', $.proxy(this, 'updateButton'));

    this.base();
  },
  updateButton,
});

// Register the Freeform SubmissionsIndex class
Craft.registerElementIndexClass('Solspace\\Freeform\\Elements\\Submission', Craft.Freeform.SubmissionsIndex);
Craft.registerElementIndexClass('Solspace\\Freeform\\Elements\\SpamSubmission', Craft.Freeform.SpamSubmissionsIndex);
