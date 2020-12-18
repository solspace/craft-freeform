import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SaveButton from '../components/SaveButton';
import Tutorials from '../components/Tutorials';
import Composer from '../containers/Composer';
import FieldList from '../containers/FieldList';
import PropertyEditor from '../containers/PropertyEditor';

class ComposerApp extends Component {
  static propTypes = {
    saveUrl: PropTypes.string.isRequired,
    formUrl: PropTypes.string.isRequired,
    csrf: PropTypes.shape({
      name: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    notificator: PropTypes.func.isRequired,
    createFieldUrl: PropTypes.string.isRequired,
    createNotificationUrl: PropTypes.string.isRequired,
    createTemplateUrl: PropTypes.string.isRequired,
    finishTutorialUrl: PropTypes.string.isRequired,
    showTutorial: PropTypes.bool.isRequired,
    defaultTemplates: PropTypes.bool.isRequired,
    canManageFields: PropTypes.bool.isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
    canManageSettings: PropTypes.bool.isRequired,
    isPro: PropTypes.bool.isRequired,
    isDbEmailTemplateStorage: PropTypes.bool.isRequired,
    isRulesEnabled: PropTypes.bool.isRequired,
    isInvisibleRecaptchaSetUp: PropTypes.bool.isRequired,
    isCommerceEnabled: PropTypes.bool.isRequired,
    renderHtml: PropTypes.bool.isRequired,
    reservedKeywords: PropTypes.array.isRequired,
  };

  static childContextTypes = {
    csrf: PropTypes.shape({
      name: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    notificator: PropTypes.func.isRequired,
    createFieldUrl: PropTypes.string.isRequired,
    createNotificationUrl: PropTypes.string.isRequired,
    createTemplateUrl: PropTypes.string.isRequired,
    canManageFields: PropTypes.bool.isRequired,
    canManageNotifications: PropTypes.bool.isRequired,
    canManageSettings: PropTypes.bool.isRequired,
    isPro: PropTypes.bool.isRequired,
    isDbEmailTemplateStorage: PropTypes.bool.isRequired,
    isRulesEnabled: PropTypes.bool.isRequired,
    isInvisibleRecaptchaSetUp: PropTypes.bool.isRequired,
    isDefaultTemplates: PropTypes.bool.isRequired,
    isCommerceEnabled: PropTypes.bool.isRequired,
    renderHtml: PropTypes.bool.isRequired,
    reservedKeywords: PropTypes.array.isRequired,
  };

  getChildContext = () => ({
    csrf: this.props.csrf,
    notificator: this.props.notificator,
    createFieldUrl: this.props.createFieldUrl,
    createNotificationUrl: this.props.createNotificationUrl,
    createTemplateUrl: this.props.createTemplateUrl,
    canManageFields: this.props.canManageFields,
    canManageNotifications: this.props.canManageNotifications,
    canManageSettings: this.props.canManageSettings,
    isPro: this.props.isPro,
    isDbEmailTemplateStorage: this.props.isDbEmailTemplateStorage,
    isRulesEnabled: this.props.isRulesEnabled,
    isDefaultTemplates: this.props.defaultTemplates,
    isInvisibleRecaptchaSetUp: this.props.isInvisibleRecaptchaSetUp,
    isCommerceEnabled: this.props.isCommerceEnabled,
    renderHtml: this.props.renderHtml,
    reservedKeywords: this.props.reservedKeywords,
  });

  render() {
    const { saveUrl, formUrl, showTutorial, finishTutorialUrl } = this.props;

    return (
      <DndProvider backend={HTML5Backend}>
        <div className="builder-interface">
          <Tutorials
            isRulesEnabled={isRulesEnabled}
            showTutorial={showTutorial}
            finishTutorialUrl={finishTutorialUrl}
          />
          <SaveButton saveUrl={saveUrl} formUrl={formUrl} />

          <div className="builder-blocks">
            <div className="lefty">
              <FieldList />
              <Composer />
            </div>
            <div className="righty">
              <PropertyEditor />
            </div>
          </div>
        </div>
      </DndProvider>
    );
  }
}

export default ComposerApp;
