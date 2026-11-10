<?php

namespace Solspace\Freeform\Bundles\Integrations\Content;

use craft\events\DefineRulesEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\web\View;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Navigation\FormNode;
use verbb\navigation\elements\Node;
use verbb\navigation\events\RegisterNodeTypeEvent;
use verbb\navigation\services\NodeTypes;
use yii\base\Event;

class ContentIntegrationsBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(View::class, View::EVENT_REGISTER_SITE_TEMPLATE_ROOTS, static function (RegisterTemplateRootsEvent $event) {
            $event->roots['freeform-integrations'] = __DIR__.'/Templates';
        });

        if (version_compare(\Craft::$app->getVersion(), '5.0', '<') || !class_exists(NodeTypes::class)) {
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
}
