import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Joyride from 'react-joyride';
import { notificator, translate } from '../app';

export default class Tutorials extends Component {
  static propTypes = {
    isRulesEnabled: PropTypes.bool.isRequired,
    showTutorial: PropTypes.bool.isRequired,
    finishTutorialUrl: PropTypes.string.isRequired,
  };

  state = {
    run: false,
  };

  componentDidMount() {
    const { showTutorial } = this.props;

    if (showTutorial) {
      this.setState({ run: true });
    }
  }

  render() {
    const { run } = this.state;
    const { showTutorial, isRulesEnabled } = this.props;

    if (!showTutorial) {
      return null;
    }

    const stepList = [...steps];
    if (isRulesEnabled) {
      stepList.push({
        title: 'Conditional Rules',
        content: 'Set up conditional rules for showing/hiding fields and skipping pages.',
        target: '.composer-form-settings .rules',
        placement: 'left',
        event: 'hover',
      });
    }

    return (
      <div>
        <Joyride
          ref="joyride"
          run={run}
          steps={stepList}
          debug={false}
          continuous={true}
          showSkipButton={true}
          callback={this.callback}
          styles={{
            options: {
              primaryColor: '#da5a47',
            },
          }}
        />
      </div>
    );
  }

  callback = ({ action, index, type }) => {
    switch (type) {
      case 'tour:end':
        const { finishTutorialUrl } = this.props;

        fetch(finishTutorialUrl, { credentials: 'same-origin' })
          .then((response) => response.json())
          .then((json) => {
            if (!json.success) {
              notificator('error', translate('Could not finish the tutorial'));
            }
          })
          .catch((exception) => notificator('error', translate('Could not finish the tutorial')));

        break;

      default:
        return;
    }
  };
}

const steps = [
  {
    title: 'Form Settings',
    content: `Adjust all settings including return URL and formatting template for your form here. To get back here at a later time, just click the 'Form Settings' button.`,
    target: '.form-settings',
    placement: 'left',
    event: 'hover',
  },
  {
    title: 'Admin Email Notifications',
    content: `If you wish to send an email notification to admin(s) upon users successfully submitting this form, set that up here.`,
    target: '.notification-settings',
    placement: 'left',
    event: 'hover',
  },
  {
    title: 'Available Fields',
    content: `Fields are global throughout all forms, but are customizable for each form. Drag and drop any of these fields into placement on the blank layout area in the center column of this page.`,
    target: '.composer-fields',
    placement: 'right',
    event: 'hover',
  },
  {
    title: 'Add New Field',
    content: `Quickly create new fields as you need them. Then adjust their properties and options in the Property Editor in the column on the right. Note: fields created here will be available for all other forms as well.`,
    target: '.composer-add-new-field-wrapper > button',
    placement: 'right',
    event: 'hover',
  },
  {
    title: 'Special Fields',
    content: `Drag and drop these when you need them. You can have as many HTML fields as you need, but should only have 1 submit button per page.`,
    target: '.composer-special-fields',
    placement: 'right',
    event: 'hover',
  },
  {
    title: 'Form Layout',
    content:
      'This is a live preview of what your form will look like. Drag and drop and fields from the left column into position here. New rows and columns will automatically be created as you position the fields.',
    target: '.builder',
    placement: 'left',
    event: 'hover',
  },
  {
    title: 'Editing Fields',
    content:
      'Fields can easily be moved around whenever you need. Clicking on any field will open up its properties in the Property Editor in the right column.',
    target: '.layout',
    placement: 'left',
    event: 'hover',
  },
  {
    title: 'Multi-page Forms',
    content:
      "To create multi-page forms, click the + button to add more pages. You can edit the names of the pages in the Property Editor in the right column. To rearrange pages, click and drag page tabs to shuffle order. To move fields from one page to another, drag and drop fields onto the page tab you'd like it to be on.",
    target: '.tab-list-wrapper',
    placement: 'bottom',
    event: 'hover',
  },
  {
    title: 'Property Editor',
    content:
      'This is where all your configuration will happen. Clicking on any field, page tab, etc in Composer layout area will load its configuration options here.',
    target: '.property-editor > div > div.sticky + div',
    placement: 'left',
    event: 'hover',
  },
];
