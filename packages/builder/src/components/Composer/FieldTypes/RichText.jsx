import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Badge from './Components/Badge';
import Label from './Components/Label';
import { translate } from '../../../app';

export default class RichText extends Component {
  static propTypes = {
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  };

  static contextTypes = {
    renderHtml: PropTypes.bool.isRequired,
  };

  getClassName() {
    return 'RichText';
  }

  render() {
    const {
      properties: { label, value },
    } = this.props;
    const { renderHtml } = this.context;

    const message = translate('Live HTML rendering currently disabled.');

    return (
      <div>
        <Label type="rich_text">
          <Badge label="Rich Text" type={Badge.TEMPLATE} />
        </Label>
        {renderHtml && <div className="composer-html-content" dangerouslySetInnerHTML={{ __html: value }} />}
        {!renderHtml && <div className="composer-html-content">{message}</div>}
      </div>
    );
  }
}
