import React from 'react';
import HtmlInput from './HtmlInput';
import SignatureImage from './assets/signature.svg';

export default class Signature extends HtmlInput {
  getClassName() {
    return 'Signature';
  }

  renderInput() {
    const { properties } = this.props;
    const {
      width = 500,
      height = 200,
      showClearButton = false,
      borderColor,
      backgroundColor,
      penColor,
      penDotSize,
    } = properties;

    const button = <button style={{ marginTop: 10 }}>Clear</button>;

    return (
      <div>
        <div
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor,
            backgroundColor,
            padding: '1px',
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <SignatureImage
            fill={penColor}
            className={'asset'}
            width={`${width - 10}px`}
            height={`${height - 10}px`}
            style={{
              marginLeft: 5,
              marginTop: 5,
            }}
          />
        </div>

        {showClearButton && button}
      </div>
    );
  }
}
