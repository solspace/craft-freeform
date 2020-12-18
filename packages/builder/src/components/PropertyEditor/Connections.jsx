import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { addConnection, removeConnection, updateConnection } from './../../actions/Connections';
import BasePropertyEditor from './BasePropertyEditor';
import ConnectionWrapper from './Components/Connections/ConnectionWrapper';
import RequirePro from './Components/RequirePro';

@connect(
  (state) => ({
    properties: state.composer.properties,
    connections: state.composer.properties.connections,
  }),
  (dispatch) => ({
    addConnection: () => dispatch(addConnection()),
    removeConnection: (index) => dispatch(removeConnection(index)),
    updateConnection: (index, properties) => dispatch(updateConnection(index, properties)),
  })
)
export default class Connections extends BasePropertyEditor {
  static title = 'Element Connections';

  static propTypes = {
    connections: PropTypes.object.isRequired,
    addConnection: PropTypes.func.isRequired,
    removeConnection: PropTypes.func.isRequired,
    updateConnection: PropTypes.func.isRequired,
  };

  static contextTypes = {
    updateField: PropTypes.func.isRequired,
    isPro: PropTypes.bool,
  };

  render() {
    const { isPro } = this.context;
    if (!isPro) {
      return <RequirePro />;
    }

    const { connections } = this.props;

    const list = [];
    if (connections.list) {
      for (const index in connections.list) {
        if (!connections.list.hasOwnProperty(index)) {
          continue;
        }

        list.push(
          <ConnectionWrapper
            index={parseInt(index)}
            connection={connections.list[index]}
            removeConnection={this.props.removeConnection}
            updateConnection={this.props.updateConnection}
          />
        );
      }
    }

    return (
      <div>
        <ul className="composer-connection-list">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <button className="btn add icon" onClick={this.props.addConnection}>
          Add a connection
        </button>
      </div>
    );
  }
}
