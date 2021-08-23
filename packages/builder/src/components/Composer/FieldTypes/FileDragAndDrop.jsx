import PropTypes from 'prop-types';
import React from 'react';
import { FILE } from './../../../constants/FieldTypes';
import Badge from './Components/Badge';
import HtmlInput from './HtmlInput';
import styled from 'styled-components';

const defaultAccent = '#3a85ee';

const Wrapper = styled.div`
  padding: 67px 20px;

  border-radius: 7px;
  border: 3px dashed ${({ accent }) => accent};
  background: ${({ theme }) => (theme === 'dark' ? '#222222' : '#ffffff')};
  color: ${({ theme }) => (theme === 'dark' ? '#656666' : '#000')};

  font-size: 1.25rem;
  text-align: center;
`;

export default class FileDragAndDrop extends HtmlInput {
  static propTypes = {
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      required: PropTypes.bool.isRequired,
      assetSourceId: PropTypes.number,
      accent: PropTypes.string,
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
    const {
      accent = defaultAccent,
      theme = 'light',
      placeholder = 'Drag and drop files here or click to upload',
    } = this.props.properties;

    return (
      <Wrapper accent={accent} theme={theme}>
        {placeholder}
      </Wrapper>
    );
  }
}
