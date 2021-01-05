import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import { connect } from 'react-redux';
import FieldHelper from '../../helpers/FieldHelper';
import BasePropertyEditor from './BasePropertyEditor';
import DualPositionProperty from './Components/Submit/DualPositionProperty';
import PositionProperty from './Components/Submit/PositionProperty';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import TextProperty from './PropertyItems/TextProperty';

@connect((state) => ({
  layout: state.composer.layout,
  properties: state.composer.properties,
  hash: state.context.hash,
}))
export default class Submit extends BasePropertyEditor {
  static propTypes = {
    layout: PropTypes.array.isRequired,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      labelNext: PropTypes.string.isRequired,
      labelPrev: PropTypes.string.isRequired,
      disablePrev: PropTypes.bool.isRequired,
      position: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {
      hash,
      properties: { labelNext, labelPrev, disablePrev, position },
    } = this.context;

    const { layout } = this.props;

    const isFirstPage = FieldHelper.isFieldOnFirstPage(hash, layout);
    const showPrev = !disablePrev && !isFirstPage;

    return (
      <div>
        <TextProperty
          label="Hash"
          instructions="Used to access this field on the frontend."
          name="handle"
          value={hash}
          className="code"
          readOnly={true}
        />

        <TextProperty
          label="Submit button Label"
          instructions="The label of the submit button"
          name="labelNext"
          value={labelNext}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        {!isFirstPage && (
          <CheckboxProperty
            label="Disable the Previous button"
            name="disablePrev"
            checked={disablePrev}
            onChangeHandler={this.update}
          />
        )}

        {showPrev && (
          <TextProperty
            label="Previous button Label"
            instructions="The label of the previous button"
            name="labelPrev"
            value={labelPrev}
            onChangeHandler={this.update}
          />
        )}

        {!showPrev && <PositionProperty position={position} onChangeHandler={this.update} />}
        {showPrev && <DualPositionProperty position={position} onChangeHandler={this.update} />}

        <AttributeEditorProperty />
      </div>
    );
  }
}
