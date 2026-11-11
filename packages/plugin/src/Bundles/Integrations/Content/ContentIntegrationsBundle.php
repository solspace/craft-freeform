<?php

namespace Solspace\Freeform\Bundles\Integrations\Content;

use craft\ckeditor\Field;
use craft\ckeditor\Plugin;
use craft\events\DefineRulesEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\web\View;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Editors\CkeditorAsset;
use Solspace\Freeform\Library\Integrations\Editors\VizyAsset;
use Solspace\Freeform\Library\Integrations\Editors\VizyForm;
use Solspace\Freeform\Library\Integrations\ExternalIntegrations;
use Solspace\Freeform\Library\Integrations\Navigation\FormNode;
use verbb\navigation\elements\Node;
use verbb\navigation\events\RegisterNodeTypeEvent;
use verbb\navigation\services\NodeTypes;
use verbb\vizy\services\EditorManifests;
use verbb\vizy\services\Extensions;
use yii\base\Event;

class ContentIntegrationsBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(View::class, View::EVENT_REGISTER_SITE_TEMPLATE_ROOTS, static function (RegisterTemplateRootsEvent $event) {
            $event->roots['freeform-integrations'] = __DIR__.'/Templates';
        });

        if (version_compare(\Craft::$app->getVersion(), '5.0', '>=')) {
            $this->registerEditors();
        }

        if (version_compare(\Craft::$app->getVersion(), '5.0', '<') || !class_exists(NodeTypes::class) || !(new ExternalIntegrations())->canRegister('navigation')) {
            return;
        }

        Event::on(NodeTypes::class, NodeTypes::EVENT_REGISTER_NODE_TYPES, static function (RegisterNodeTypeEvent $event) {
            $event->types[] = FormNode::class;
        });

        // Navigation 3 ignores beforeSaveNode()'s return value. Validate through
        // Craft's model rules so both Navigation 3 and 4 reject unavailable forms.
        Event::on(Node::class, Node::EVENT_DEFINE_RULES, [$this, 'defineNodeRules']);
    }

    public function defineNodeRules(DefineRulesEvent $event): void
    {
        $node = $event->sender;
        $event->rules[] = ['data', static function () use ($node): void {
            $type = $node->nodeType();
            if ($type instanceof FormNode) {
                $type->validateForm();
            }
        }, 'skipOnEmpty' => false];
    }

    private function registerEditors(): void
    {
        if (class_exists(Plugin::class)
            && (new ExternalIntegrations())->canRegister('ckeditor')) {
            Plugin::registerCkeditorPackage(CkeditorAsset::class, 'ckeditor.js');
            Event::on(Field::class, Field::EVENT_MODIFY_PURIFIER_CONFIG, static function ($event) {
                if (\in_array('freeformForm', $event->sender->toolbar, true)) {
                    $event->config->getHTMLDefinition(true)->addAttribute('div', 'data-freeform-form', 'Text');
                }
            });
        }

        // The native node API is Vizy 4-specific. Vizy 3 can continue using
        // the existing Craft-field content-block recipe without new assets.
        if (class_exists(Extensions::class)
            && (new ExternalIntegrations())->canRegister('vizy')
            && method_exists(\verbb\vizy\base\Node::class, 'renderOccurrenceHtml')) {
            Event::on(Extensions::class, Extensions::EVENT_REGISTER_EXTENSIONS, static function ($event) {
                $event->nodes[] = VizyForm::class;
            });
            Event::on(EditorManifests::class, EditorManifests::EVENT_MODIFY_EDITOR_CONFIG, static function ($event) {
                $event->config = (new ExternalIntegrations())->editorConfig($event->config);
                if (!\Craft::$app->getRequest()->getIsConsoleRequest() && \Craft::$app->getRequest()->getIsCpRequest()
                    && \in_array('freeformForm', $event->config['capabilities']['nodes'] ?? [], true)) {
                    \Craft::$app->getView()->registerAssetBundle(VizyAsset::class);
                }
            });
        }
    }
}
