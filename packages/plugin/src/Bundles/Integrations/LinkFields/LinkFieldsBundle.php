<?php

namespace Solspace\Freeform\Bundles\Integrations\LinkFields;

use craft\events\RegisterComponentTypesEvent;
use craft\fields\Link;
use presseddigital\linkit\services\LinkitService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Links\CraftFormLink;
use Solspace\Freeform\Library\Integrations\Links\HyperFormLink;
use Solspace\Freeform\Library\Integrations\Links\LinkitFormLink;
use verbb\hyper\services\Links;
use yii\base\Event;

class LinkFieldsBundle extends FeatureBundle
{
    public function __construct()
    {
        if (version_compare(\Craft::$app->getVersion(), '5.0', '<')) {
            return;
        }

        // Keep optional adapters outside Bundles: the bundle loader reflects every
        // class there, including on Craft 4 and sites without Hyper or Linkit.
        if (class_exists(Link::class)) {
            Event::on(Link::class, Link::EVENT_REGISTER_LINK_TYPES, static function (RegisterComponentTypesEvent $event) {
                $event->types[] = CraftFormLink::class;
            });
        }

        if (class_exists(Links::class)) {
            Event::on(Links::class, Links::EVENT_REGISTER_LINK_TYPES, static function (RegisterComponentTypesEvent $event) {
                $event->types[] = HyperFormLink::class;
            });
        }

        if (class_exists(LinkitService::class)) {
            Event::on(LinkitService::class, LinkitService::EVENT_REGISTER_LINKIT_FIELD_TYPES, static function ($event) {
                $event->types[] = new LinkitFormLink();
            });
        }
    }
}
