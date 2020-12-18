import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate } from '../../../../app';
import { SelectProperty } from '../../PropertyItems';
import Entries from './Entries';
import Users from './Users';

const map = {
  entries: Entries,
  users: Users,
};

export default class ConnectionWrapper extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    connection: PropTypes.object.isRequired,
    updateConnection: PropTypes.func.isRequired,
    removeConnection: PropTypes.func.isRequired,
  };

  render() {
    const { connection, updateConnection, index } = this.props;

    let element = null;
    if (map[connection.type]) {
      const ReactElement = map[connection.type];

      element = <ReactElement connection={connection} updateConnection={updateConnection} index={index} />;
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
          options={[
            { key: 'entries', value: translate('Entries', {}, 'app') },
            { key: 'users', value: translate('Users', {}, 'app') },
          ]}
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
