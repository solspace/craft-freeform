<?php

namespace Solspace\Freeform\Bundles\Integrations\ElementConnections\ValueTransformers;

use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessElementValueEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class ArrayValueTransformer extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            ElementIntegrationInterface::class,
            ElementIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'transformValue']
        );
    }

    public function transformValue(ProcessElementValueEvent $event): void
    {
        $value = $event->getValue();

        $craftField = $event->getCraftField();

        $hasOptions = $craftField instanceof BaseOptionsField;
        $hasRelations = $craftField instanceof BaseRelationField;
        if ($hasOptions || $hasRelations) {
            if (!\is_array($value)) {
                $value = [$value];
            }
        } else {
            if (\is_array($value)) {
                $value = reset($value);
            }
        }

        $event->setValue($value);
    }
}
