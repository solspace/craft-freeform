import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { fetchGeneratedOptionsIfNeeded, invalidateGeneratedOptions } from '../../../actions/GeneratedOptionLists';
import { translate } from '../../../app';
import * as ExternalOptions from '../../../constants/ExternalOptions';
import OptionTable from '../Components/OptionTable/OptionTable';
import PredefinedOptionTable from '../Components/OptionTable/PredefinedOptionTable';
import BasePropertyItem from './BasePropertyItem';
import CustomProperty from './CustomProperty';
import SelectProperty from './SelectProperty';
import TextProperty from './TextProperty';

const initialState = {
  emptyOption: '',
};

@connect(
  (state) => ({
    sourceTargets: state.sourceTargets,
    customFields: state.customFields,
    isFetchingOptions: state.generatedOptionLists.isFetching,
    generatedOptions: state.generatedOptionLists.cache,
    sites: state.sites.list,
    currentSiteId: state.sites.currentSiteId,
  }),
  (dispatch) => ({
    fetchGeneratedOptions: (hash, source, target, configuration) => {
      dispatch(invalidateGeneratedOptions(hash));
      dispatch(fetchGeneratedOptionsIfNeeded(hash, source, target, configuration));
    },
  })
)
export default class ExternalOptionsProperty extends BasePropertyItem {
  static propTypes = {
    ...BasePropertyItem.propTypes,
    label: PropTypes.string,
    source: PropTypes.string,
    target: PropTypes.node,
    showEmptyOptionInput: PropTypes.bool,
    configuration: PropTypes.shape({
      labelField: PropTypes.string,
      valueField: PropTypes.string,
      start: PropTypes.number,
      end: PropTypes.number,
      listType: PropTypes.string,
      valueType: PropTypes.string,
      emptyOption: PropTypes.string,
    }),
    showCustomValues: PropTypes.bool,
    customOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        label: PropTypes.any.isRequired,
      })
    ).isRequired,
    sourceTargets: PropTypes.object,
    customFields: PropTypes.array,
    fetchGeneratedOptions: PropTypes.func.isRequired,
    isFetchingOptions: PropTypes.bool.isRequired,
    generatedOptions: PropTypes.object,
    sites: PropTypes.array.isRequired,
    currentSiteId: PropTypes.number.isRequired,
    availableSources: PropTypes.array,
  };

  static contextTypes = {
    updateField: PropTypes.func.isRequired,
    hash: PropTypes.string,
    isCommerceEnabled: PropTypes.bool,
  };

  static sourceOptions = [
    { key: ExternalOptions.SOURCE_CUSTOM, value: translate('Custom Options') },
    { key: ExternalOptions.SOURCE_ENTRIES, value: translate('Entries') },
    { key: ExternalOptions.SOURCE_CATEGORIES, value: translate('Categories') },
    { key: ExternalOptions.SOURCE_TAGS, value: translate('Tags') },
    { key: ExternalOptions.SOURCE_USERS, value: translate('Users') },
    { key: ExternalOptions.SOURCE_ASSETS, value: translate('Assets') },
    { key: ExternalOptions.SOURCE_COMMERCE_PRODUCTS, value: translate('Commerce Products') },
    { key: ExternalOptions.SOURCE_PREDEFINED, value: translate('Predefined Options') },
  ];

  lastOptions = null;
  updateEmptyOptionTrigger = null;

  constructor(props, context) {
    super(props, context);

    this.state = {
      ...initialState,
      emptyOption: this.getConfigProperty('emptyOption', ''),
    };

    this.getDisplayProperties = this.getDisplayProperties.bind(this);
    this.getConfigProperty = this.getConfigProperty.bind(this);
    this.getExternalSourceComponents = this.getExternalSourceComponents.bind(this);
    this.getCustomValuesComponent = this.getCustomValuesComponent.bind(this);
    this.getPredefinedValuesComponent = this.getPredefinedValuesComponent.bind(this);
    this.getGeneratedOptions = this.getGeneratedOptions.bind(this);
    this.onChangeSource = this.onChangeSource.bind(this);
    this.onChangePredefinedTarget = this.onChangePredefinedTarget.bind(this);
    this.onUpdateConfig = this.onUpdateConfig.bind(this);
    this.onUpdateEmptyOption = this.onUpdateEmptyOption.bind(this);
    this.persistEmptyOption = this.persistEmptyOption.bind(this);
    this.onChangeTarget = this.onChangeTarget.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!this.props || !this.props.configuration) {
      return;
    }

    if (prevProps.configuration && this.props.configuration.emptyOption !== prevProps.configuration.emptyOption) {
      this.setState({ emptyOption: this.getConfigProperty('emptyOption', '') });
    }
  }

  render() {
    const { isCommerceEnabled } = this.context;
    const { source = ExternalOptions.SOURCE_CUSTOM, availableSources } = this.props;

    let sourceOptions = ExternalOptionsProperty.sourceOptions.filter(
      (item) => item.key !== ExternalOptions.SOURCE_COMMERCE_PRODUCTS || isCommerceEnabled
    );

    if (availableSources) {
      const curatedSourceOptions = [];
      for (const option of sourceOptions) {
        if (availableSources.includes(option.key)) {
          curatedSourceOptions.push(option);
        }
      }

      sourceOptions = curatedSourceOptions;
    }

    const displayProperties = this.getDisplayProperties();

    return (
      <div className="field">
        <h4>{translate('Options Editor')}</h4>
        <SelectProperty
          label="Source"
          name="source"
          value={source}
          options={sourceOptions}
          onChangeHandler={this.onChangeSource}
        />
        {displayProperties}
      </div>
    );
  }

  /**
   * Returns a renderable component based on SOURCE, TARGET and CONFIGURATION
   */
  getDisplayProperties() {
    const { source = ExternalOptions.SOURCE_CUSTOM } = this.props;

    switch (source) {
      case ExternalOptions.SOURCE_ENTRIES:
      case ExternalOptions.SOURCE_CATEGORIES:
      case ExternalOptions.SOURCE_TAGS:
      case ExternalOptions.SOURCE_USERS:
      case ExternalOptions.SOURCE_ASSETS:
      case ExternalOptions.SOURCE_COMMERCE_PRODUCTS:
        return this.getExternalSourceComponents();

      case ExternalOptions.SOURCE_CUSTOM:
        return this.getCustomValuesComponent();

      default:
        return this.getPredefinedValuesComponent();
    }
  }

  /**
   * @returns {*}
   */
  getExternalSourceComponents() {
    const { target = null, source, sourceTargets, sites, currentSiteId } = this.props;
    const { customFields, showEmptyOptionInput } = this.props;
    let list = [...sourceTargets[source]];

    const isUserSource = source === ExternalOptions.SOURCE_USERS;

    let emptyOptionComponent = null;
    if (showEmptyOptionInput) {
      emptyOptionComponent = (
        <TextProperty
          label="Empty Option Label (optional)"
          instructions="To show an empty option at the beginning of the Select field options, enter a value here. Leave blank if you don't want a first option."
          name="emptyOption"
          value={this.state.emptyOption}
          onChangeHandler={this.onUpdateEmptyOption}
        />
      );
    }

    const showSiteSelect = ExternalOptions.HAS_SITE_SELECTION.indexOf(source) !== -1 && sites.length > 1;
    const selectedSiteId = this.getConfigProperty('siteId', currentSiteId);

    if (showSiteSelect) {
      list = list.filter((item) => !item.sites || item.sites.indexOf(selectedSiteId) !== -1);
    }

    let defaultLabel = 'title';
    if (source === ExternalOptions.SOURCE_ASSETS) {
      defaultLabel = 'filename';
    } else if (source === ExternalOptions.SOURCE_USERS) {
      defaultLabel = 'username';
    }

    return (
      <div>
        {emptyOptionComponent}

        {showSiteSelect && (
          <SelectProperty
            label="Site"
            name="siteId"
            value={selectedSiteId}
            options={sites.map((item) => ({ key: item.id, value: item.name }))}
            isNumeric={true}
            onChangeHandler={this.onUpdateConfig}
          />
        )}

        <SelectProperty
          label="Target"
          name="target"
          value={target}
          options={list}
          onChangeHandler={this.onChangeTarget}
        />

        <SelectProperty
          label="Option Label"
          name="labelField"
          value={this.getConfigProperty('labelField', defaultLabel)}
          options={ExternalOptionsProperty.getSourceSpecificValueFieldChoices(source, customFields)}
          onChangeHandler={this.onUpdateConfig}
        />

        <SelectProperty
          label="Option Value"
          name="valueField"
          value={this.getConfigProperty('valueField', 'id')}
          options={ExternalOptionsProperty.getSourceSpecificValueFieldChoices(source, customFields)}
          onChangeHandler={this.onUpdateConfig}
        />

        <SelectProperty
          label="Order By"
          name="orderBy"
          value={this.getConfigProperty('orderBy', 'id')}
          options={ExternalOptionsProperty.getSourceSpecificOrderFields(source)}
          onChangeHandler={this.onUpdateConfig}
        />

        <SelectProperty
          label="Sort"
          name="sort"
          value={this.getConfigProperty('sort', 'asc')}
          options={[
            { key: 'asc', value: translate('Ascending') },
            { key: 'desc', value: translate('Descending') },
          ]}
          onChangeHandler={this.onUpdateConfig}
        />

        {this.getGeneratedOptions()}
      </div>
    );
  }

  /**
   * @returns {*}
   */
  getCustomValuesComponent() {
    const { values, value, customOptions, updateHandler, showCustomValues } = this.props;

    return (
      <CustomProperty
        label="Options"
        instructions="Options for this field"
        content={
          <OptionTable
            value={value}
            values={values}
            options={customOptions}
            triggerCustomValues={updateHandler}
            showCustomValues={showCustomValues}
          />
        }
      />
    );
  }

  getPredefinedValuesComponent() {
    const { target = null, showEmptyOptionInput = false } = this.props;

    let specificOptions = null;
    switch (target) {
      case ExternalOptions.PREDEFINED_STATES:
      case ExternalOptions.PREDEFINED_STATES_TERRITORIES:
      case ExternalOptions.PREDEFINED_PROVINCES:
      case ExternalOptions.PREDEFINED_PROVINCES_FR:
      case ExternalOptions.PREDEFINED_PROVINCES_BIL:
      case ExternalOptions.PREDEFINED_COUNTRIES:
      case ExternalOptions.PREDEFINED_LANGUAGES:
      case ExternalOptions.PREDEFINED_CURRENCIES:
        specificOptions = (
          <div>
            <SelectProperty
              label="Option Label"
              name="listType"
              options={[
                { key: ExternalOptions.TYPE_ABBREVIATED, value: translate('Abbreviated') },
                { key: ExternalOptions.TYPE_FULL, value: translate('Full') },
              ]}
              value={this.getConfigProperty('listType', ExternalOptions.TYPE_FULL)}
              onChangeHandler={this.onUpdateConfig}
            />

            <SelectProperty
              label="Option Value"
              name="valueType"
              options={[
                { key: ExternalOptions.TYPE_ABBREVIATED, value: translate('Abbreviated') },
                { key: ExternalOptions.TYPE_FULL, value: translate('Full') },
              ]}
              value={this.getConfigProperty('valueType', ExternalOptions.TYPE_ABBREVIATED)}
              onChangeHandler={this.onUpdateConfig}
            />
          </div>
        );

        break;

      case ExternalOptions.PREDEFINED_NUMBERS:
        specificOptions = (
          <div>
            <TextProperty
              label="Range Start"
              name="start"
              isNumeric={true}
              value={this.getConfigProperty('start', ExternalOptions.DEFAULT_NUMBERS_RANGE_START)}
              onChangeHandler={this.onUpdateConfig}
            />

            <TextProperty
              label="Range End"
              name="end"
              isNumeric={true}
              value={this.getConfigProperty('end', ExternalOptions.DEFAULT_NUMBERS_RANGE_END)}
              onChangeHandler={this.onUpdateConfig}
            />
          </div>
        );

        break;

      case ExternalOptions.PREDEFINED_YEARS:
        specificOptions = (
          <div>
            <TextProperty
              label="Range Start"
              name="start"
              isNumeric={true}
              value={this.getConfigProperty('start', ExternalOptions.DEFAULT_YEAR_RANGE_START)}
              onChangeHandler={this.onUpdateConfig}
            />

            <TextProperty
              label="Range End"
              name="end"
              isNumeric={true}
              value={this.getConfigProperty('end', ExternalOptions.DEFAULT_YEAR_RANGE_END)}
              onChangeHandler={this.onUpdateConfig}
            />

            <SelectProperty
              label="Sort Direction"
              name="sort"
              options={[
                { key: ExternalOptions.SORT_ASC, value: translate('Ascending') },
                { key: ExternalOptions.SORT_DESC, value: translate('Descending') },
              ]}
              value={this.getConfigProperty('sort', ExternalOptions.DEFAULT_YEAR_SORT)}
              onChangeHandler={this.onUpdateConfig}
            />
          </div>
        );

        break;

      case ExternalOptions.PREDEFINED_MONTHS:
        specificOptions = (
          <div>
            <SelectProperty
              label="Option Label"
              name="listType"
              options={[
                { key: ExternalOptions.TYPE_FULL, value: translate('Full') },
                { key: ExternalOptions.TYPE_ABBREVIATED, value: translate('Abbreviated') },
                { key: ExternalOptions.TYPE_INT, value: translate('Single number') },
                { key: ExternalOptions.TYPE_INT_LEADING_ZERO, value: translate('2-digit number') },
              ]}
              value={this.getConfigProperty('listType', ExternalOptions.TYPE_FULL)}
              onChangeHandler={this.onUpdateConfig}
            />
            <SelectProperty
              label="Option Value"
              name="valueType"
              options={[
                { key: ExternalOptions.TYPE_FULL, value: translate('Full') },
                { key: ExternalOptions.TYPE_ABBREVIATED, value: translate('Abbreviated') },
                { key: ExternalOptions.TYPE_INT, value: translate('Single number') },
                { key: ExternalOptions.TYPE_INT_LEADING_ZERO, value: translate('2-digit number') },
              ]}
              value={this.getConfigProperty('valueType', ExternalOptions.TYPE_FULL)}
              onChangeHandler={this.onUpdateConfig}
            />
          </div>
        );

        break;

      case ExternalOptions.PREDEFINED_DAYS:
        specificOptions = (
          <div>
            <SelectProperty
              label="Option Label"
              name="listType"
              options={[
                { key: ExternalOptions.TYPE_INT, value: translate('Single number') },
                { key: ExternalOptions.TYPE_INT_LEADING_ZERO, value: translate('2-digit number') },
              ]}
              value={this.getConfigProperty('listType', ExternalOptions.TYPE_INT)}
              onChangeHandler={this.onUpdateConfig}
            />
            <SelectProperty
              label="Option Value"
              name="valueType"
              options={[
                { key: ExternalOptions.TYPE_INT, value: translate('Single number') },
                { key: ExternalOptions.TYPE_INT_LEADING_ZERO, value: translate('2-digit number') },
              ]}
              value={this.getConfigProperty('valueType', ExternalOptions.TYPE_INT)}
              onChangeHandler={this.onUpdateConfig}
            />
          </div>
        );

        break;

      case ExternalOptions.PREDEFINED_DAYS_OF_WEEK:
        specificOptions = (
          <div>
            <SelectProperty
              label="Option Label"
              name="listType"
              options={[
                { key: ExternalOptions.TYPE_FULL, value: translate('Full') },
                { key: ExternalOptions.TYPE_ABBREVIATED, value: translate('Abbreviated') },
                { key: ExternalOptions.TYPE_INT, value: translate('Single number') },
              ]}
              value={this.getConfigProperty('listType', ExternalOptions.TYPE_FULL)}
              onChangeHandler={this.onUpdateConfig}
            />
            <SelectProperty
              label="Option Value"
              name="valueType"
              options={[
                { key: ExternalOptions.TYPE_FULL, value: translate('Full') },
                { key: ExternalOptions.TYPE_ABBREVIATED, value: translate('Abbreviated') },
                { key: ExternalOptions.TYPE_INT, value: translate('Single number') },
              ]}
              value={this.getConfigProperty('valueType', ExternalOptions.TYPE_FULL)}
              onChangeHandler={this.onUpdateConfig}
            />
          </div>
        );

        break;
    }

    let emptyOptionComponent = null;
    if (showEmptyOptionInput) {
      emptyOptionComponent = (
        <TextProperty
          label="Empty Option Label (optional)"
          instructions="To show an empty option at the beginning of the Select field options, enter a value here. Leave blank if you don't want a first option."
          name="emptyOption"
          value={this.state.emptyOption}
          onChangeHandler={this.onUpdateEmptyOption}
        />
      );
    }

    return (
      <div>
        {emptyOptionComponent}

        <SelectProperty
          label="Target"
          name="target"
          value={target}
          options={[
            { key: ExternalOptions.PREDEFINED_STATES, value: translate('States') },
            { key: ExternalOptions.PREDEFINED_STATES_TERRITORIES, value: translate('States & Territories') },
            { key: ExternalOptions.PREDEFINED_PROVINCES, value: translate('Provinces - English') },
            { key: ExternalOptions.PREDEFINED_PROVINCES_FR, value: translate('Provinces - French') },
            { key: ExternalOptions.PREDEFINED_PROVINCES_BIL, value: translate('Provinces - Bilingual') },
            { key: ExternalOptions.PREDEFINED_COUNTRIES, value: translate('Countries') },
            { key: ExternalOptions.PREDEFINED_LANGUAGES, value: translate('Languages') },
            { key: ExternalOptions.PREDEFINED_CURRENCIES, value: translate('Currencies') },
            { key: ExternalOptions.PREDEFINED_NUMBERS, value: translate('Numbers') },
            { key: ExternalOptions.PREDEFINED_YEARS, value: translate('Years') },
            { key: ExternalOptions.PREDEFINED_MONTHS, value: translate('Months') },
            { key: ExternalOptions.PREDEFINED_DAYS, value: translate('Days') },
            { key: ExternalOptions.PREDEFINED_DAYS_OF_WEEK, value: translate('Days of Week') },
          ]}
          onChangeHandler={this.onChangePredefinedTarget}
        />

        {specificOptions}
        {this.getGeneratedOptions()}
      </div>
    );
  }

  /**
   * @returns {*}
   */
  getGeneratedOptions() {
    const { values, value, generatedOptions, isFetchingOptions } = this.props;
    const { hash } = this.context;

    if (isFetchingOptions && this.lastOptions) {
      return this.lastOptions;
    }

    const options = [];
    if (generatedOptions && generatedOptions[hash]) {
      for (const item of generatedOptions[hash]) {
        options.push({
          value: item.value,
          label: item.label,
        });
      }
    }

    const optionsProperty = (
      <CustomProperty
        label="Options"
        instructions="Options for this field"
        content={<PredefinedOptionTable value={value} values={values} options={options} />}
      />
    );

    this.lastOptions = optionsProperty;

    return optionsProperty;
  }

  /**
   * @param source
   * @param customFields
   * @returns {Array}
   */
  static getSourceSpecificValueFieldChoices(source, customFields) {
    let excludedUserFields = [
      'title',
      'slug',
      'uri',
      'filename',
      'defaultPrice',
      'defaultSku',
      'defaultHeight',
      'defaultWidth',
      'defaultWeight',
      'defaultLength',
      'expiryDate',
    ];
    let excludedEntryFields = [
      'username',
      'firstName',
      'lastName',
      'fullName',
      'email',
      'filename',
      'defaultPrice',
      'defaultSku',
      'defaultHeight',
      'defaultWidth',
      'defaultWeight',
      'defaultLength',
      'expiryDate',
    ];
    let excludedAssetFields = [
      'title',
      'slug',
      'uri',
      'username',
      'firstName',
      'lastName',
      'fullName',
      'email',
      'defaultPrice',
      'defaultSku',
      'defaultHeight',
      'defaultWidth',
      'defaultWeight',
      'defaultLength',
      'expiryDate',
    ];
    let excludedCommerceProductFields = ['username', 'firstName', 'lastName', 'fullName', 'email', 'filename'];

    let excludedFields;
    switch (source) {
      case ExternalOptions.SOURCE_USERS:
        excludedFields = excludedUserFields;
        break;

      case ExternalOptions.SOURCE_ASSETS:
        excludedFields = excludedAssetFields;
        break;

      case ExternalOptions.SOURCE_COMMERCE_PRODUCTS:
        excludedFields = excludedCommerceProductFields;
        break;

      case ExternalOptions.SOURCE_ENTRIES:
      default:
        excludedFields = excludedEntryFields;
        break;
    }

    const exportList = [];
    for (const item of customFields) {
      if (excludedFields.indexOf(item.key) === -1) {
        exportList.push(item);
      }
    }

    return exportList;
  }

  /**
   * @param source
   * @returns {Array}
   */
  static getSourceSpecificOrderFields(source) {
    switch (source) {
      case ExternalOptions.SOURCE_USERS:
        return [
          { key: 'id', value: 'ID' },
          { key: 'username', value: 'Username' },
          { key: 'email', value: 'Email' },
          { key: 'firstName', value: 'First Name' },
          { key: 'lastName', value: 'Last Name' },
          { key: 'fullName', value: 'Full Name' },
          { key: 'dateCreated', value: 'Date Created' },
          { key: 'dateUpdated', value: 'Date Updated' },
        ];

      case ExternalOptions.SOURCE_ASSETS:
        return [
          { key: 'id', value: 'ID' },
          { key: 'title', value: 'Title' },
          { key: 'filename', value: 'Filename' },
          { key: 'dateCreated', value: 'Date Created' },
          { key: 'dateUpdated', value: 'Date Updated' },
        ];

      case ExternalOptions.SOURCE_COMMERCE_PRODUCTS:
        return [
          { key: 'id', value: 'ID' },
          { key: 'title', value: 'Title' },
          { key: 'slug', value: 'Slug' },
          { key: 'uri', value: 'URI' },
          { key: 'dateCreated', value: 'Date Created' },
          { key: 'dateUpdated', value: 'Date Updated' },
        ];

      case ExternalOptions.SOURCE_ENTRIES:
      default:
        return [
          { key: 'id', value: 'ID' },
          { key: 'title', value: 'Title' },
          { key: 'slug', value: 'Slug' },
          { key: 'uri', value: 'URI' },
          { key: 'lft', value: 'Structure' },
          { key: 'postDate', value: 'Post Date' },
          { key: 'dateCreated', value: 'Date Created' },
          { key: 'dateUpdated', value: 'Date Updated' },
        ];
    }
  }

  /**
   * @param prop
   * @param defaultValue
   * @returns {*}
   */
  getConfigProperty(prop, defaultValue = null) {
    const { configuration = {} } = this.props;

    if (configuration && configuration.hasOwnProperty(prop)) {
      return configuration[prop];
    }

    return defaultValue;
  }

  /**
   * @param event
   */
  onChangeSource(event) {
    const { updateField, hash } = this.context;
    const { fetchGeneratedOptions } = this.props;
    const { value } = event.target;
    const { emptyOption } = this.state;

    let options = {};

    switch (value) {
      case ExternalOptions.SOURCE_ENTRIES:
      case ExternalOptions.SOURCE_CATEGORIES:
      case ExternalOptions.SOURCE_TAGS:
      case ExternalOptions.SOURCE_USERS:
      case ExternalOptions.SOURCE_ASSETS:
      case ExternalOptions.SOURCE_COMMERCE_PRODUCTS:
        options = {
          source: value,
          target: null,
          configuration: {
            emptyOption,
          },
        };

        break;

      case ExternalOptions.SOURCE_PREDEFINED:
        options = {
          source: value,
          target: ExternalOptions.PREDEFINED_STATES,
          configuration: {
            valueType: ExternalOptions.TYPE_ABBREVIATED,
            listType: ExternalOptions.TYPE_FULL,
            emptyOption,
          },
        };

        break;

      default:
        options = {
          source: ExternalOptions.SOURCE_CUSTOM,
          target: null,
          configuration: null,
        };

        break;
    }

    updateField({
      value: '',
      values: [],
      ...options,
    });
    if (value !== ExternalOptions.SOURCE_CUSTOM) {
      fetchGeneratedOptions(hash, options.source, options.target, options.configuration);
    }
  }

  onChangeTarget(event) {
    const { hash } = this.context;
    const { fetchGeneratedOptions, configuration, source, onChangeHandler } = this.props;
    const { value } = event.target;

    onChangeHandler(event);
    fetchGeneratedOptions(hash, source, value, configuration);
  }

  onChangePredefinedTarget(event) {
    const { updateField, hash } = this.context;
    const { source, fetchGeneratedOptions } = this.props;
    const { value } = event.target;

    let updatedConfiguration = {};
    switch (value) {
      case ExternalOptions.PREDEFINED_STATES:
      case ExternalOptions.PREDEFINED_STATES_TERRITORIES:
      case ExternalOptions.PREDEFINED_PROVINCES:
      case ExternalOptions.PREDEFINED_PROVINCES_FR:
      case ExternalOptions.PREDEFINED_PROVINCES_BIL:
      case ExternalOptions.PREDEFINED_COUNTRIES:
      case ExternalOptions.PREDEFINED_LANGUAGES:
      case ExternalOptions.PREDEFINED_CURRENCIES:
        updatedConfiguration = {
          valueType: ExternalOptions.TYPE_ABBREVIATED,
          listType: ExternalOptions.TYPE_FULL,
        };

        break;

      case ExternalOptions.PREDEFINED_NUMBERS:
        updatedConfiguration = {
          start: 0,
          end: 10,
        };

        break;

      case ExternalOptions.PREDEFINED_YEARS:
        updatedConfiguration = {
          sort: ExternalOptions.SORT_DESC,
          start: 100,
          end: 0,
        };

        break;

      case ExternalOptions.PREDEFINED_MONTHS:
        updatedConfiguration = {
          valueType: ExternalOptions.TYPE_FULL,
          listType: ExternalOptions.TYPE_FULL,
        };

        break;

      case ExternalOptions.PREDEFINED_DAYS:
        updatedConfiguration = {
          valueType: ExternalOptions.TYPE_INT,
          listType: ExternalOptions.TYPE_INT,
        };

        break;

      case ExternalOptions.PREDEFINED_DAYS_OF_WEEK:
        updatedConfiguration = {
          valueType: ExternalOptions.TYPE_FULL,
          listType: ExternalOptions.TYPE_FULL,
        };

        break;
    }

    updateField({
      value: '',
      values: [],
      source,
      target: value,
      configuration: updatedConfiguration,
    });
    fetchGeneratedOptions(hash, source, value, updatedConfiguration);
  }

  /**
   * @param event
   */
  onUpdateConfig(event) {
    const { updateField, hash } = this.context;
    const { configuration, fetchGeneratedOptions, source, target } = this.props;
    const { name, value } = event.target;

    let isNumeric = false;
    if (event.target.dataset.isNumeric) {
      if (event.target.dataset.isNumeric !== 'false') {
        isNumeric = true;
      }
    }

    let parsedValue = value;
    if (isNumeric) {
      const isNegative = /^-/.test(parsedValue);

      parsedValue = (parsedValue + '').replace(/[^0-9\.]/, '');
      parsedValue = parsedValue ? parseInt(parsedValue) : 0;

      if (isNegative && parsedValue >= 0) {
        parsedValue *= -1;
      }
    }

    let updatedConfiguration = configuration ? { ...configuration } : {};
    updatedConfiguration[name] = parsedValue;

    updateField({
      value: '',
      values: [],
      configuration: updatedConfiguration,
    });
    fetchGeneratedOptions(hash, source, target, updatedConfiguration);
  }

  onUpdateEmptyOption(event) {
    const { value } = event.target;

    this.setState({ emptyOption: value });
    if (this.updateEmptyOptionTrigger) {
      clearTimeout(this.updateEmptyOptionTrigger);
    }

    this.updateEmptyOptionTrigger = setTimeout(this.persistEmptyOption, 500);
  }

  persistEmptyOption() {
    const { hash, updateField } = this.context;
    const { configuration, fetchGeneratedOptions, source, target } = this.props;
    const { emptyOption } = this.state;

    const updatedConfiguration = {
      ...configuration,
      emptyOption: emptyOption,
    };

    updateField({ configuration: updatedConfiguration });
    fetchGeneratedOptions(hash, source, target, updatedConfiguration);
  }
}
