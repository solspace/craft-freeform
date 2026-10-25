<?php

namespace Solspace\Freeform\Bundles\Form\Types\Pages;

use Solspace\Freeform\Events\Forms\Types\RegisterFormTypeEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Form\TypesService;
use yii\base\Event;

class PagesBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            TypesService::class,
            TypesService::EVENT_REGISTER_FORM_TYPES,
            [$this, 'registerFormTypes']
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function registerFormTypes(RegisterFormTypeEvent $event): void
    {
        $event->addType(Page::class);
    }
}
