import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate } from '../../../../app';
import { SelectProperty } from '../../PropertyItems';
import Entries from './Entries';
import Users from './Users';
import CalendarEvents from './CalendarEvents';

const map = {
  entries: Entries,
  users: Users,
  calendar: CalendarEvents,
};

export default class ConnectionWrapper extends Component {
  static contextTypes = {
    isCalendarEnabled: PropTypes.bool,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
    connection: PropTypes.object.isRequired,
    updateConnection: PropTypes.func.isRequired,
    removeConnection: PropTypes.func.isRequired,
  };

  render() {
    const { isCalendarEnabled } = this.context;
    const { connection, updateConnection, index } = this.props;

    let element = null;
    if (map[connection.type]) {
      const ReactElement = map[connection.type];

      element = <ReactElement connection={connection} updateConnection={updateConnection} index={index} />;
    }

    const options = [
      { key: 'entries', value: translate('Entries', {}, 'app') },
      { key: 'users', value: translate('Users', {}, 'app') },
    ];

    if (isCalendarEnabled) {
      options.push({ key: 'calendar', value: translate('Calendar Events') });
    }

    return (
      <div className="connection-item field">
        <ul className="composer-actions composer-connection-actions">
          <li className="composer-action-remove" onClick={this.removeConnection} />
        </ul>

        <SelectProperty
          label="Type"
          name="type"
          value={connection.type}
          onChangeHandler={this.updateConnection}
          options={options}
        />

        {element}

        <hr style={{ margin: '20px 0' }} />
      </div>
    );
  }

  updateConnection = (event) => {
    const { value } = event.target;
    const { index, updateConnection } = this.props;

    updateConnection(index, { type: value });
  };

  removeConnection = () => {
    const { index } = this.props;

    this.props.removeConnection(index);
  };
}
