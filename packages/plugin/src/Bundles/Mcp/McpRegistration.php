<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\events\RegisterComponentTypesEvent;
use craft\services\Mcp;
use yii\base\Event;

final class McpRegistration
{
    public static function register(): void
    {
        Event::on(
            Mcp::class,
            Mcp::EVENT_REGISTER_CAPABILITY_TYPES,
            static function (RegisterComponentTypesEvent $event): void {
                $event->types[] = FormTools::class;
                $event->types[] = TranslationTools::class;
                $event->types[] = SubmissionTools::class;
            },
        );
    }
}
