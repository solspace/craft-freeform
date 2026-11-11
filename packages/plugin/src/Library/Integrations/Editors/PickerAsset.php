<?php

namespace Solspace\Freeform\Library\Integrations\Editors;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;
use craft\web\View;
use Solspace\Freeform\Library\Integrations\ExternalIntegrations;
use Solspace\Freeform\Library\Integrations\Links\FormLinkProvider;

class PickerAsset extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = __DIR__.'/assets';
        $this->publishOptions['forceCopy'] = \Craft::$app->getConfig()->getGeneral()->devMode;
        $this->depends = [CpAsset::class];
        $this->js = ['picker.js'];
        $this->css = ['editors.css'];
        parent::init();

        \Craft::$app->getView()->registerTranslations('freeform', ['Freeform Form', 'Select a form', 'Unavailable form']);
        \Craft::$app->getView()->registerJsWithVars(
            static fn ($options) => "window.FreeformEditorForms = {$options};",
            [\Craft::$container->get(FormLinkProvider::class)->getOptions()],
            View::POS_END,
        );
        $integrations = new ExternalIntegrations();
        \Craft::$app->getView()->registerJsWithVars(
            static fn ($settings) => "window.FreeformEditorSettings = {$settings};",
            [['icon' => $integrations->getIconSvg(), 'enabled' => array_combine(array_keys(ExternalIntegrations::DEFINITIONS), array_map(static fn ($id) => $integrations->isEnabled($id), array_keys(ExternalIntegrations::DEFINITIONS)))]],
            View::POS_END,
        );
    }
}
