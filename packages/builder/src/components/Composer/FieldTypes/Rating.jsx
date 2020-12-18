import React from 'react';
import HtmlInput from './HtmlInput';

export default class Rating extends HtmlInput {
  getClassName() {
    return 'Rating';
  }

  renderInput() {
    const {
      properties: { maxValue, value, colorIdle, colorSelected },
    } = this.props;

    let stars = [];
    for (let i = 1; i <= maxValue; i++) {
      stars.push(<span key={i} style={{ color: value >= i ? colorSelected : colorIdle }} />);
    }

    return <div className="rating">{stars}</div>;
  }
}
