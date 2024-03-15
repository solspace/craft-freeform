<?php

namespace Solspace\Freeform\Bundles\Integrations\Elements\ValueTransformers;

use craft\fields\Lightswitch;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class BooleanValueTransformer extends FeatureBundle
{
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
        $value = $event->getValue();

        $craftField = $event->getCraftField();
        if ($craftField instanceof Lightswitch || 'enabled' === $event->getHandle()) {
            if (\in_array(strtolower($value), ['false', 'n', 'no'], true)) {
                $value = false;
            } else {
                $value = (bool) $value;
            }
        }

        $event->setValue($value);
    }
}
