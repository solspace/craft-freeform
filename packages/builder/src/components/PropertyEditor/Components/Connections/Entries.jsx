import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from '../../../../app';
import { CheckboxProperty, SelectProperty } from '../../PropertyItems';
import ConnectionBase from './ConnectionBase';

@connect((state) => ({
  sectionList: state.sourceTargets.entries,
}))
export default class Entries extends ConnectionBase {
  static propTypes = {
    ...ConnectionBase.propTypes,
    sectionList: PropTypes.array,
  };

  getResetWaterfall = () => ['section', 'entryType'];

  getSpecificCraftFields = () => {
    const selectedEntryType = this.getSelectedEntryType();
    if (selectedEntryType && selectedEntryType.hasTitleField) {
      return [{ handle: 'title', name: translate(selectedEntryType.titleLabel, {}, 'app') }];
    }
  };

  getCraftFieldLayoutFieldIds = () => {
    return this.getSelectedEntryType().fieldLayoutFieldIds;
  };

  getSelectedSection = () => {
    const {
      sectionList,
      connection: { section = null },
    } = this.props;

    if (section) {
      const selectedSection = sectionList.find((item) => parseInt(item.key) === parseInt(section));
      if (selectedSection) {
        return selectedSection;
      }
    }

    return null;
  };

  getSelectedEntryType = () => {
    const {
      connection: { entryType = null },
    } = this.props;

    const selectedSection = this.getSelectedSection();
    if (selectedSection && selectedSection.entryTypes) {
      const selectedEntryType = selectedSection.entryTypes.find((item) => parseInt(item.key) === parseInt(entryType));
      if (selectedEntryType) {
        return selectedEntryType;
      }
    }

    return null;
  };

  render() {
    const { sectionList, connection } = this.props;
    const { section = null, entryType = null, disabled = false } = connection;

    const sectionListCopy = [...sectionList];
    sectionListCopy.splice(0, 1);
    const selectedSection = this.getSelectedSection();

    let entryTypeInput = null;
    if (selectedSection && selectedSection.entryTypes) {
      entryTypeInput = (
        <SelectProperty
          label="Entry Type"
          translationCategory={'app'}
          name="entryType"
          value={entryType}
          emptyOption="Select an entry type"
          options={selectedSection.entryTypes}
          onChangeHandler={this.updateSelection}
        />
      );
    }

    return (
      <div>
        <SelectProperty
          label="Section"
          translationCategory={'app'}
          name="section"
          value={section}
          emptyOption="Select a section"
          options={sectionListCopy}
          onChangeHandler={this.updateSelection}
        />
        {entryTypeInput}

        {entryTypeInput && entryType && (
          <CheckboxProperty
            label="Disable entries?"
            instructions="The entry will be set to disabled upon creation if this is checked. Will be set to enabled otherwise."
            name="disabled"
            checked={!!disabled}
            onChangeHandler={this.updateSelection}
          />
        )}

        {entryTypeInput && entryType && this.getFieldMapping()}
      </div>
    );
  }
}
