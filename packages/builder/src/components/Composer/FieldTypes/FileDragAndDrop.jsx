import PropTypes from 'prop-types';
import React from 'react';
import { FILE } from './../../../constants/FieldTypes';
import Badge from './Components/Badge';
import HtmlInput from './HtmlInput';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 67px 20px;

  border-radius: 7px;
  border: 3px dashed #3a85ee;
  background: #ffffff;

  font-size: 16px;
  text-align: center;
`;

export default class FileDragAndDrop extends HtmlInput {
  static propTypes = {
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
      required: PropTypes.bool.isRequired,
      assetSourceId: PropTypes.number,
    }).isRequired,
  };

  getClassName() {
    return 'FileDragAndDrop';
  }

  getType() {
    return FILE;
  }

  getBadges() {
    const badges = super.getBadges();
    const {
      properties: { assetSourceId },
    } = this.props;

    if (!assetSourceId) {
      badges.push(<Badge key={'asset'} label="No Asset Source" type={Badge.WARNING} />);
    }

    return badges;
  }

  renderInput() {
    return (
      <Wrapper>
        <strong>Choose a file</strong> or drag it here
      </Wrapper>
    );
  }
}
