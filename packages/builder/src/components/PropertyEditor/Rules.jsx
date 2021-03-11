import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { addPageBlock } from '../../actions/Rules';
import { translate } from '../../app';
import { PAGE } from '../../constants/FieldTypes';
import BasePropertyEditor from './BasePropertyEditor';
import PageBlock from './Components/Rules/PageBlock';
import { CheckboxProperty } from './PropertyItems';

@connect(
  (state) => ({
    properties: state.composer.properties,
  }),
  (dispatch) => ({
    addPageBlock: (pageHash) => dispatch(addPageBlock(pageHash)),
  })
)
export default class Rules extends BasePropertyEditor {
  static title = 'Conditional Rules';

  static propTypes = {
    properties: PropTypes.object,
    addPageBlock: PropTypes.func,
  };

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.state = { showHandles: false };
  }

  render() {
    const { properties, addPageBlock } = this.props;
    const { rules } = properties;
    const list = [];
    const availablePages = getAvailablePages(properties);
    const usedPageHashes = [];
    const { showHandles } = this.state;

    if (rules && rules.list) {
      for (const [hash, rule] of Object.entries(rules.list)) {
        const { fieldRules, gotoRules } = rule;
        const pageProps = properties[hash];

        if (!pageProps) {
          continue;
        }

        usedPageHashes.push(hash);

        list.push(
          <PageBlock
            pageHash={hash}
            page={pageProps}
            fieldRules={fieldRules}
            gotoRules={gotoRules}
            showHandles={showHandles}
          />
        );
      }
    }

    const unusedPages = getUnusedPages(availablePages, usedPageHashes);

    return (
      <div>
        <ul>
          {list.map((item, i) => (
            <li className="composer-rule-page-block" key={i}>
              {item}
            </li>
          ))}
        </ul>

        {!!unusedPages.length && (
          <div className="select">
            <select value="" onChange={(event) => addPageBlock(event.target.value)}>
              <option value="">{translate('Select a page to add rules to')}</option>

              {unusedPages.map((item) => (
                <option value={item.key} key={item.key}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>
        )}

        <CheckboxProperty
          label="Show field handles?"
          instructions="Enable this to also show the field handle for all fields for better clarity if you have several fields with the same label."
          checked={this.state.showHandles}
          onChangeHandler={() => {
            this.setState({ showHandles: !this.state.showHandles });
          }}
        />
      </div>
    );
  }
}

const getAvailablePages = (properties) => {
  const usablePages = [];

  for (const [key, item] of Object.entries(properties)) {
    if (item.type !== PAGE) continue;

    usablePages.push({
      key,
      value: item.label,
    });
  }

  return usablePages;
};

const getUnusedPages = (pages, usedPageHashes) => {
  const unusedPages = [];

  for (const item of pages) {
    if (usedPageHashes.indexOf(item.key) === -1) {
      unusedPages.push(item);
    }
  }

  return unusedPages;
};
