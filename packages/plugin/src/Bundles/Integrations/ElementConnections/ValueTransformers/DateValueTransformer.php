<?php

namespace Solspace\Freeform\Bundles\Integrations\ElementConnections\ValueTransformers;

use Carbon\Carbon;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class DateValueTransformer extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            ElementIntegrationInterface::class,
            ElementIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'transformValue']
        );
    }

    public static function getPriority(): int
    {
        return 500;
    }

    public function transformValue(ProcessValueEvent $event): void
    {
        $value = $event->getValue();
        if (empty($value)) {
            return;
        }

        try {
            $value = new Carbon($value);
        } catch (\Exception $e) {
            $value = new Carbon();
        }

        $event->setValue($value);
    }
}
