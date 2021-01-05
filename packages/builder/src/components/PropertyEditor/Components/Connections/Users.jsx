import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from '../../../../app';
import { CheckboxListProperty, CheckboxProperty, SelectProperty } from '../../PropertyItems';
import ConnectionBase from './ConnectionBase';

@connect((state) => ({
  userGroupsList: state.sourceTargets.users,
}))
export default class Users extends ConnectionBase {
  static propTypes = {
    ...ConnectionBase.propTypes,
    userGroupsList: PropTypes.array,
  };

  getResetWaterfall = () => [];

  getSpecificCraftFields = () => {
    return [
      { handle: 'username', name: translate('Username', {}, 'app') },
      { handle: 'firstName', name: translate('First Name', {}, 'app') },
      { handle: 'lastName', name: translate('Last Name', {}, 'app') },
      { handle: 'photoId', name: translate('User Photo', {}, 'app') },
      { handle: 'email', name: translate('Email', {}, 'app') },
      { handle: 'newPassword', name: translate('Password', {}, 'app') },
    ];
  };

  getCraftFieldLayoutFieldIds = () => {
    const { userGroupsList } = this.props;
    const list = userGroupsList.find((item) => item.fieldLayoutFieldIds);

    return list ? list.fieldLayoutFieldIds : [];
  };

  updateGroupSelection = (object) => {
    for (const [name, value] of Object.entries(object)) {
      this.persistValues(
        name,
        value.map((groupId) => parseInt(groupId))
      );
    }
  };

  render() {
    const { userGroupsList, connection } = this.props;
    const { active = false, sendActivation = true } = connection;
    let { group } = connection;

    if (!Array.isArray(group)) {
      group = [group];
    }

    group = group.map((item) => parseInt(item));

    const userGroupListModified = [];
    for (let i = 0; i < userGroupsList.length; i++) {
      if (i === 0) continue;

      userGroupListModified.push(userGroupsList[i]);
    }

    return (
      <div>
        <CheckboxListProperty
          label="User Group"
          name="group"
          values={group}
          options={userGroupListModified}
          updateField={this.updateGroupSelection}
        />

        <CheckboxProperty
          label="Activate users?"
          instructions="The user will be activated upon creation if this is checked. Will be set to pending otherwise."
          name="active"
          checked={!!active}
          onChangeHandler={this.updateSelection}
        />

        {!active && (
          <CheckboxProperty
            label="Send activation email?"
            instructions="The user will receive an email with activation details if this is checked."
            name="sendActivation"
            checked={!!sendActivation}
            onChangeHandler={this.updateSelection}
          />
        )}

        {group && this.getFieldMapping()}
      </div>
    );
  }
}
