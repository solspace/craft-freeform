<?php

namespace Solspace\Freeform\Bundles\Integrations\Elements\ValueTransformers;

use craft\fields\Date;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class DateTransformer extends FeatureBundle
{
    private const DATE_FIELDS = [
        'postDate',
        'expiryDate',
        'dateCreated',
        'dateUpdated',
    ];

    public function __construct()
    {
        Event::on(
            ElementIntegrationInterface::class,
            ElementIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'transformValue']
        );
    }

    public function transformValue(ProcessValueEvent $event): void
    {
        $isBuiltInDate = \in_array($event->getHandle(), self::DATE_FIELDS, true);
        $isDateInstance = $event->getCraftField() instanceof Date;

        if (!$isBuiltInDate && !$isDateInstance) {
            return;
        }

        try {
            $value = new \DateTime($event->getValue());
        } catch (\Exception $e) {
            $value = null;
        }

        $event->setValue($value);
    }
}
