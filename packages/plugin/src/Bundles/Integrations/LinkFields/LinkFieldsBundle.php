<?php

namespace Solspace\Freeform\Bundles\Integrations\LinkFields;

use craft\events\RegisterComponentTypesEvent;
use CraftCms\Cms\Field\LinkTypes;
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
        app(LinkTypes::class)->register(CraftFormLink::class);

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
