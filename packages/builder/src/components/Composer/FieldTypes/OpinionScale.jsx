import React from 'react';
import HtmlInput from './HtmlInput';

export default class OpinionScale extends HtmlInput {
  getClassName() {
    return 'OpinionScale';
  }

  getInputClassNames() {
    return ['opinion-scale'];
  }

  renderInput() {
    const {
      properties: { scales = [], legends = [], value },
    } = this.props;
    const scaleElements = [];
    const legendElements = [];

    const idPrefix = Math.random();

    for (const [index, opt] of scales.entries()) {
      if (!opt.value) continue;

      const id = `${idPrefix}-${index}`;
      const isSelected = `${opt.value}` === `${value}`;

      scaleElements.push(
        <li className={isSelected ? 'active' : ''} key={id}>
          <input type="radio" id={id} readOnly={true} disabled={true} value={opt.value} checked={isSelected} />
          <label htmlFor={id}>{opt.label ? opt.label : opt.value}</label>
        </li>
      );
    }

    let i = 0;
    for (const legend of legends) {
      if (legend.legend) {
        legendElements.push(<li key={i++}>{legend.legend}</li>);
      }
    }

    return (
      <div className="opinion-scale">
        <ul className="opinion-scale-scales">{scaleElements}</ul>
        {legendElements.length > 0 && <ul className="opinion-scale-legends">{legendElements}</ul>}
      </div>
    );
  }
}
