<?php

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\EventListeners;

use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Other\GoogleSheetsIntegrationInterface;
use yii\base\Event;

class GoogleSheetsValueTransformers extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            GoogleSheetsIntegrationInterface::class,
            GoogleSheetsIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'transformArrayValues']
        );
    }

    public function transformArrayValues(ProcessValueEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof GoogleSheetsIntegrationInterface) {
            return;
        }

        $field = $event->getFreeformField();
        if (!$field instanceof MultiValueInterface) {
            return;
        }

        $event->setValue(implode(', ', $event->getValue()));
    }
}
